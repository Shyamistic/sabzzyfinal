import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllProducts = async (req, res, next) => {
  try {
    const { category, featured, limit = '20', page = '1' } = req.query;

    const where = {};
    if (category) {
      where.category = category;
    }
    if (featured === 'true') {
      where.isFeatured = true;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          vendor: {
            select: {
              shopName: true,
              rating: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: parseInt(limit),
        skip,
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      status: 'success',
      data: {
        products,
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

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        vendor: {
          select: {
            id: true,
            shopName: true,
            shopAddress: true,
            rating: true,
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found',
      });
    }

    res.json({
      status: 'success',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const searchProducts = async (req, res, next) => {
  try {
    const { q, category } = req.query;

    if (!q) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query is required',
      });
    }

    const where = {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ],
    };

    if (category) {
      where.category = category;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        vendor: {
          select: {
            shopName: true,
            rating: true,
          },
        },
      },
      take: 20,
    });

    res.json({
      status: 'success',
      data: products,
    });
  } catch (error) {
    next(error);
  }
};
