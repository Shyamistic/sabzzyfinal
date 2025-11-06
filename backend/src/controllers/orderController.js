import { PrismaClient } from '@prisma/client';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const prisma = new PrismaClient();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrder = async (req, res, next) => {
  try {
    const { addressId, paymentMethod, notes } = req.body;

    if (!addressId || !paymentMethod) {
      return res.status(400).json({
        status: 'error',
        message: 'Address and payment method are required',
      });
    }

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          include: {
            vendor: true,
          },
        },
      },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cart is empty',
      });
    }

    // Get address
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: req.user.id,
      },
    });

    if (!address) {
      return res.status(404).json({
        status: 'error',
        message: 'Address not found',
      });
    }

    // Group items by vendor
    const ordersByVendor = {};
    
    cartItems.forEach((item) => {
      const vendorId = item.product.vendorId;
      if (!ordersByVendor[vendorId]) {
        ordersByVendor[vendorId] = [];
      }
      ordersByVendor[vendorId].push(item);
    });

    const orders = [];

    // Create separate order for each vendor
    for (const [vendorId, items] of Object.entries(ordersByVendor)) {
      const totalAmount = items.reduce((sum, item) => {
        const price = item.product.discountPrice || item.product.price;
        return sum + price * item.quantity;
      }, 0);

      // Generate unique order number
      const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

      // Create Razorpay order if payment method is online
      let razorpayOrderId = null;
      if (paymentMethod === 'UPI' || paymentMethod === 'Card') {
        const razorpayOrder = await razorpay.orders.create({
          amount: Math.round(totalAmount * 100), // Amount in paise
          currency: 'INR',
          receipt: orderNumber,
        });
        razorpayOrderId = razorpayOrder.id;
      }

      // Create order
      const order = await prisma.order.create({
        data: {
          orderNumber,
          userId: req.user.id,
          vendorId,
          totalAmount,
          paymentMethod,
          paymentId: razorpayOrderId,
          deliveryAddress: {
            title: address.title,
            fullAddress: address.fullAddress,
            landmark: address.landmark,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            phoneNumber: address.phoneNumber,
          },
          notes,
          status: paymentMethod === 'COD' ? 'CONFIRMED' : 'PENDING',
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.discountPrice || item.product.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          vendor: {
            select: {
              shopName: true,
              shopAddress: true,
            },
          },
        },
      });

      // Update product stock
      for (const item of items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      orders.push(order);
    }

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: { userId: req.user.id },
    });

    res.status(201).json({
      status: 'success',
      message: 'Order placed successfully',
      data: {
        orders,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      // Update order status
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'CONFIRMED',
          paymentId: razorpay_payment_id,
        },
      });

      res.json({
        status: 'success',
        message: 'Payment verified successfully',
      });
    } else {
      res.status(400).json({
        status: 'error',
        message: 'Invalid signature',
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getUserOrders = async (req, res, next) => {
  try {
    const { status, page = '1', limit = '10' } = req.query;

    const where = { userId: req.user.id };
    if (status) {
      where.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                  unit: true,
                },
              },
            },
          },
          vendor: {
            select: {
              shopName: true,
              shopAddress: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: parseInt(limit),
        skip,
      }),
      prisma.order.count({ where }),
    ]);

    res.json({
      status: 'success',
      data: {
        orders,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        vendor: {
          select: {
            shopName: true,
            shopAddress: true,
            rating: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found',
      });
    }

    res.json({
      status: 'success',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status',
      });
    }

    // Only vendors can update order status (you can add vendor authentication)
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    res.json({
      status: 'success',
      message: 'Order status updated',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};
