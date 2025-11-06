import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          include: {
            vendor: {
              select: {
                shopName: true,
                rating: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      status: 'success',
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};

export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

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

    const existingItem = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId,
        },
      },
    });

    if (existingItem) {
      return res.status(409).json({
        status: 'error',
        message: 'Product already in wishlist',
      });
    }

    const wishlistItem = await prisma.wishlist.create({
      data: {
        userId: req.user.id,
        productId,
      },
      include: {
        product: true,
      },
    });

    res.status(201).json({
      status: 'success',
      message: 'Product added to wishlist',
      data: wishlistItem,
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const wishlistItem = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId,
        },
      },
    });

    if (!wishlistItem) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not in wishlist',
      });
    }

    await prisma.wishlist.delete({
      where: {
        id: wishlistItem.id,
      },
    });

    res.json({
      status: 'success',
      message: 'Product removed from wishlist',
    });
  } catch (error) {
    next(error);
  }
};
