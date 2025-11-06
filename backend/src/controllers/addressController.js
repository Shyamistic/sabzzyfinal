import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAddresses = async (req, res, next) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    res.json({
      status: 'success',
      data: addresses,
    });
  } catch (error) {
    next(error);
  }
};

export const createAddress = async (req, res, next) => {
  try {
    const { title, fullAddress, landmark, city, state, pincode, phoneNumber, isDefault } = req.body;

    if (!fullAddress || !city || !state || !pincode || !phoneNumber) {
      return res.status(400).json({
        status: 'error',
        message: 'All required fields must be provided',
      });
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: req.user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: req.user.id,
        title: title || 'Home',
        fullAddress,
        landmark,
        city,
        state,
        pincode,
        phoneNumber,
        isDefault: isDefault || false,
      },
    });

    res.status(201).json({
      status: 'success',
      message: 'Address created successfully',
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, fullAddress, landmark, city, state, pincode, phoneNumber, isDefault } = req.body;

    const existingAddress = await prisma.address.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!existingAddress) {
      return res.status(404).json({
        status: 'error',
        message: 'Address not found',
      });
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: req.user.id,
          isDefault: true,
          id: { not: id },
        },
        data: {
          isDefault: false,
        },
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data: {
        title,
        fullAddress,
        landmark,
        city,
        state,
        pincode,
        phoneNumber,
        isDefault,
      },
    });

    res.json({
      status: 'success',
      message: 'Address updated successfully',
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;

    const address = await prisma.address.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!address) {
      return res.status(404).json({
        status: 'error',
        message: 'Address not found',
      });
    }

    await prisma.address.delete({
      where: { id },
    });

    res.json({
      status: 'success',
      message: 'Address deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const setDefaultAddress = async (req, res, next) => {
  try {
    const { id } = req.params;

    const address = await prisma.address.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!address) {
      return res.status(404).json({
        status: 'error',
        message: 'Address not found',
      });
    }

    // Unset all other defaults
    await prisma.address.updateMany({
      where: {
        userId: req.user.id,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });

    // Set this as default
    const updatedAddress = await prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });

    res.json({
      status: 'success',
      message: 'Default address updated',
      data: updatedAddress,
    });
  } catch (error) {
    next(error);
  }
};
