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
        gsm: 130,
        weave: 'Plain Weave',
        composition: '100% Organic Cotton',
        width: '58 inches',
        productionStatus: ProductionStatus.READY_STOCK,
        moq: 50,
        dispatchMinDays: 7,
        dispatchMaxDays: 10,
        certifications: ['GOTS', 'OEKO-TEX 100'],
        description:
          'Premium 40s organic cotton poplin with crisp handfeel, ideal for shirts and summer wear. Soft finish, breathable and sustainably sourced. GOTS and OEKO-TEX 100 certified.',
        imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600',
      },
      {
        name: 'Indigo Yarn-Dyed Check Shirting',
        gsm: 155,
        weave: 'Check Shirting',
        composition: '100% Cotton, Yarn-Dyed Indigo',
        width: '58 inches',
        productionStatus: ProductionStatus.RUNNING_PRODUCTION,
        moq: 1200,
        dispatchMinDays: 15,
        dispatchMaxDays: 20,
        certifications: ['BCI'],
        description:
          'Classic indigo yarn-dyed check shirting with authentic fade character. Running production — ideal for casual shirts and uniforms.',
      },
      {
        name: 'Bamboo Lyocell Blend Satin',
        gsm: 180,
        weave: 'Satin',
        composition: '70% Bamboo, 30% Lyocell',
        width: '60 inches',
        productionStatus: ProductionStatus.MADE_TO_ORDER,
        moq: 6000,
        dispatchMinDays: 25,
        dispatchMaxDays: 35,
        certifications: ['OEKO-TEX 100', 'GRS'],
        description:
          'Luxurious bamboo lyocell satin with silky drape and eco-credentials. Made to order with GRS and OEKO-TEX 100 certifications.',
      },
      {
        name: 'Heavyweight Canvas Greige',
        gsm: 340,
        weave: 'Canvas',
        composition: '100% Cotton Canvas',
        width: '62 inches',
        productionStatus: ProductionStatus.READY_STOCK,
        moq: 100,
        dispatchMinDays: 5,
        dispatchMaxDays: 8,
        certifications: ['GOTS'],
        description:
          'Heavyweight greige canvas for bags, upholstery and workwear. Ready stock with GOTS certification and rugged durability.',
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
