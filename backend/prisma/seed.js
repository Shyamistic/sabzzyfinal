import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.address.deleteMany();
  await prisma.product.deleteMany();
  await prisma.vendorProfile.deleteMany();
  await prisma.user.deleteMany();

  // Create vendors
  const vendor1 = await prisma.user.create({
    data: {
      phoneNumber: '+919876543210',
      password: await bcrypt.hash('vendor123', 10),
      name: 'Ravi Kumar',
      role: 'VENDOR',
      isVerified: true,
      vendorProfile: {
        create: {
          shopName: 'Fresh Vegetables Corner',
          shopAddress: 'Market Road, Sector 15, Bangalore',
          description: 'Your trusted source for farm-fresh vegetables',
          rating: 4.7,
        }
      }
    },
    include: { vendorProfile: true }
  });

  const vendor2 = await prisma.user.create({
    data: {
      phoneNumber: '+919876543211',
      password: await bcrypt.hash('vendor123', 10),
      name: 'Sita Devi',
      role: 'VENDOR',
      isVerified: true,
      vendorProfile: {
        create: {
          shopName: 'Organic Green Store',
          shopAddress: 'MG Road, Indiranagar, Bangalore',
          description: 'Premium organic fruits and vegetables',
          rating: 4.9,
        }
      }
    },
    include: { vendorProfile: true }
  });

  // Create consumer
  const consumer = await prisma.user.create({
    data: {
      phoneNumber: '+919876543212',
      password: await bcrypt.hash('user123', 10),
      name: 'Amit Sharma',
      role: 'CONSUMER',
      isVerified: true,
    }
  });

  // Create products for vendor 1
  const vegetablesVendor1 = [
    {
      name: 'Tomato',
      description: 'Fresh red tomatoes, perfect for salads and cooking',
      price: 40,
      discountPrice: 35,
      category: 'Vegetables',
      unit: 'kg',
      stock: 50,
      imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400',
      isFeatured: true,
      vendorId: vendor1.vendorProfile.id,
    },
    {
      name: 'Onion',
      description: 'Fresh onions, essential for every kitchen',
      price: 30,
      discountPrice: 25,
      category: 'Vegetables',
      unit: 'kg',
      stock: 100,
      imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400',
      isFeatured: false,
      vendorId: vendor1.vendorProfile.id,
    },
    {
      name: 'Potato',
      description: 'Farm fresh potatoes, great for multiple dishes',
      price: 25,
      category: 'Vegetables',
      unit: 'kg',
      stock: 120,
      imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400',
      isFeatured: false,
      vendorId: vendor1.vendorProfile.id,
    },
    {
      name: 'Carrot',
      description: 'Sweet and crunchy carrots, rich in vitamins',
      price: 45,
      discountPrice: 40,
      category: 'Vegetables',
      unit: 'kg',
      stock: 60,
      imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400',
      isFeatured: true,
      vendorId: vendor1.vendorProfile.id,
    },
    {
      name: 'Green Chilli',
      description: 'Fresh green chillies for that perfect spice',
      price: 60,
      category: 'Vegetables',
      unit: 'kg',
      stock: 30,
      imageUrl: 'https://images.unsplash.com/photo-1583164225768-7f9ec39663e3?w=400',
      isFeatured: false,
      vendorId: vendor1.vendorProfile.id,
    },
  ];

  // Create products for vendor 2
  const productsVendor2 = [
    {
      name: 'Spinach',
      description: 'Fresh green spinach leaves, packed with iron',
      price: 30,
      category: 'Leafy Greens',
      unit: 'bunch',
      stock: 40,
      imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400',
      isFeatured: true,
      vendorId: vendor2.vendorProfile.id,
    },
    {
      name: 'Coriander',
      description: 'Fresh coriander leaves for garnishing',
      price: 20,
      category: 'Leafy Greens',
      unit: 'bunch',
      stock: 50,
      imageUrl: 'https://images.unsplash.com/photo-1592415486689-125cbbfcbee2?w=400',
      isFeatured: false,
      vendorId: vendor2.vendorProfile.id,
    },
    {
      name: 'Apple',
      description: 'Crispy red apples from Himachal',
      price: 150,
      discountPrice: 130,
      category: 'Fruits',
      unit: 'kg',
      stock: 45,
      imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400',
      isFeatured: true,
      vendorId: vendor2.vendorProfile.id,
    },
    {
      name: 'Banana',
      description: 'Fresh yellow bananas, rich in potassium',
      price: 50,
      category: 'Fruits',
      unit: 'dozen',
      stock: 80,
      imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400',
      isFeatured: false,
      vendorId: vendor2.vendorProfile.id,
    },
    {
      name: 'Cabbage',
      description: 'Fresh green cabbage, perfect for salads',
      price: 35,
      discountPrice: 30,
      category: 'Vegetables',
      unit: 'piece',
      stock: 35,
      imageUrl: 'https://images.unsplash.com/photo-1594282320829-b3f58c5ad2c6?w=400',
      isFeatured: false,
      vendorId: vendor2.vendorProfile.id,
    },
    {
      name: 'Broccoli',
      description: 'Fresh broccoli, super healthy vegetable',
      price: 80,
      discountPrice: 70,
      category: 'Vegetables',
      unit: 'kg',
      stock: 25,
      imageUrl: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400',
      isFeatured: true,
      vendorId: vendor2.vendorProfile.id,
    },
    {
      name: 'Cauliflower',
      description: 'Fresh white cauliflower',
      price: 40,
      category: 'Vegetables',
      unit: 'piece',
      stock: 40,
      imageUrl: 'https://images.unsplash.com/photo-1568584711283-96dd6ba621c6?w=400',
      isFeatured: false,
      vendorId: vendor2.vendorProfile.id,
    },
    {
      name: 'Capsicum',
      description: 'Colorful bell peppers, great for cooking',
      price: 60,
      discountPrice: 50,
      category: 'Vegetables',
      unit: 'kg',
      stock: 30,
      imageUrl: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400',
      isFeatured: false,
      vendorId: vendor2.vendorProfile.id,
    },
    {
      name: 'Mint Leaves',
      description: 'Fresh mint leaves for tea and garnishing',
      price: 15,
      category: 'Leafy Greens',
      unit: 'bunch',
      stock: 60,
      imageUrl: 'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?w=400',
      isFeatured: false,
      vendorId: vendor2.vendorProfile.id,
    },
    {
      name: 'Cucumber',
      description: 'Fresh cucumbers, perfect for salads',
      price: 35,
      category: 'Vegetables',
      unit: 'kg',
      stock: 55,
      imageUrl: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=400',
      isFeatured: false,
      vendorId: vendor2.vendorProfile.id,
    },
  ];

  // Insert all products
  const allProducts = [...vegetablesVendor1, ...productsVendor2];
  for (const product of allProducts) {
    await prisma.product.create({ data: product });
  }

  // Create sample address for consumer
  await prisma.address.create({
    data: {
      userId: consumer.id,
      title: 'Home',
      fullAddress: 'Flat 301, Green Valley Apartments, Whitefield',
      landmark: 'Near Phoenix Mall',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560066',
      phoneNumber: '+919876543212',
      isDefault: true,
    }
  });

  console.log('✅ Seed completed successfully!');
  console.log('📱 Test Credentials:');
  console.log('Consumer: +919876543212 / user123');
  console.log('Vendor 1: +919876543210 / vendor123');
  console.log('Vendor 2: +919876543211 / vendor123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
