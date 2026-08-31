import { PrismaClient, ProductionStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const buyerPassword = await bcrypt.hash('buyer123', 10);
  const supplierPassword = await bcrypt.hash('supplier123', 10);

  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@mylonex.demo' },
    update: {},
    create: {
      name: 'Arjun Mehta',
      email: 'buyer@mylonex.demo',
      passwordHash: buyerPassword,
      role: 'BUYER',
    },
  });

  const supplier = await prisma.user.upsert({
    where: { email: 'supplier@mylonex.demo' },
    update: {},
    create: {
      name: 'Kyal Textile Mills',
      email: 'supplier@mylonex.demo',
      passwordHash: supplierPassword,
      role: 'SUPPLIER',
    },
  });

  console.log('Users:', buyer.email, supplier.email);

  await prisma.fabric.deleteMany();

  const fabrics = await prisma.fabric.createMany({
    data: [
      {
        name: 'Organic Cotton Poplin 40s',
        gsm: 110,
        weave: 'Plain Weave',
        composition: '100% Organic Cotton',
        width: '58 inches',
        productionStatus: ProductionStatus.READY_STOCK,
        moq: 500,
        dispatchMinDays: 7,
        dispatchMaxDays: 10,
        certifications: ['GOTS', 'OEKO-TEX'],
        description:
          'Premium 40s organic cotton poplin with crisp handfeel, ideal for shirts and summer wear. Soft finish, breathable and sustainably sourced.',
        imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600',
      },
      {
        name: 'Cotton Blend Twill 240 GSM',
        gsm: 240,
        weave: 'Twill 3/1',
        composition: '65% Cotton, 35% Polyester',
        width: '60 inches',
        productionStatus: ProductionStatus.RUNNING_PRODUCTION,
        moq: 1000,
        dispatchMinDays: 15,
        dispatchMaxDays: 20,
        certifications: ['OEKO-TEX'],
        description:
          'Durable twill weave fabric for workwear and trousers. High abrasion resistance with wrinkle-free finish. Running production — dispatch within 20 days.',
      },
      {
        name: 'Linen Herringbone 180 GSM',
        gsm: 180,
        weave: 'Herringbone',
        composition: '100% Pure Linen',
        width: '54 inches',
        productionStatus: ProductionStatus.MADE_TO_ORDER,
        moq: 300,
        dispatchMinDays: 25,
        dispatchMaxDays: 35,
        certifications: ['GOTS', 'BCI'],
        description:
          'Luxurious herringbone linen with natural texture. Perfect for premium jackets and dresses. Made to order with custom dyeing available.',
      },
      {
        name: 'Poly Viscose Suiting 280 GSM',
        gsm: 280,
        weave: 'Twill 2/2',
        composition: '70% Polyester, 30% Viscose',
        width: '58 inches',
        productionStatus: ProductionStatus.READY_STOCK,
        moq: 800,
        dispatchMinDays: 5,
        dispatchMaxDays: 8,
        certifications: ['OEKO-TEX', 'WRAP'],
        description:
          'High-quality suit fabric with excellent drape and crease recovery. Ideal for formal suits, blazers and trousers. Ready stock available.',
      },
    ],
  });

  console.log(`Fabric count: ${fabrics.count}`);

  // Clean inquiries/orders for fresh seed
  await prisma.order.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.inquiry.deleteMany();

  console.log('Seeding complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
