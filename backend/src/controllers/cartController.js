import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCart = async (req, res, next) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          include: {
            vendor: {
              select: {
                shopName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const total = cartItems.reduce((sum, item) => {
      const price = item.product.discountPrice || item.product.price;
      return sum + price * item.quantity;
    }, 0);

    res.json({
      status: 'success',
      data: {
        items: cartItems,
        total,
        itemCount: cartItems.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        status: 'error',
        message: 'Product ID is required',
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found',
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        status: 'error',
        message: 'Insufficient stock',
      });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId,
        },
      },
    });

    let cartItem;

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      
      if (product.stock < newQuantity) {
        return res.status(400).json({
          status: 'error',
          message: 'Insufficient stock',
        });
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: {
          product: true,
        },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId: req.user.id,
          productId,
          quantity,
        },
        include: {
          product: true,
        },
      });
    }

    res.status(201).json({
      status: 'success',
      message: 'Product added to cart',
      data: cartItem,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({
        status: 'error',
        message: 'Quantity must be at least 1',
      });
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
      include: {
        product: true,
      },
    });

    if (!cartItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Cart item not found',
      });
    }

    if (cartItem.product.stock < quantity) {
      return res.status(400).json({
        status: 'error',
        message: 'Insufficient stock',
      });
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: {
        product: true,
      },
    });

    res.json({
      status: 'success',
      message: 'Cart updated',
      data: updatedItem,
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const { id } = req.params;

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!cartItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Cart item not found',
      });
    }

    await prisma.cartItem.delete({
      where: { id },
    });

    res.json({
      status: 'success',
      message: 'Item removed from cart',
    });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    await prisma.cartItem.deleteMany({
      where: { userId: req.user.id },
    });

    res.json({
      status: 'success',
      message: 'Cart cleared',
    });
  } catch (error) {
    next(error);
  }
};
