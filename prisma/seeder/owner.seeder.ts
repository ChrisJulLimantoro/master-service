import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const isProduction = process.env.NODE_ENV === 'production';

// Dynamically determine the path for the helper
const { RmqHelper } = isProduction
  ? require('../dist/src/helper/rmq.helper')
  : require('../../src/helper/rmq.helper');

const prisma = new PrismaClient();

async function main() {
  // Create default companies
  const data = await prisma.owner.findFirst({
    where: {
      email: 'christian@gmail.com',
    },
  });
  if (data) {
    console.log('User already exists, skipping creation');
    return;
  }
  const user1 = await prisma.owner.create({
    data: {
      email: 'christian@gmail.com',
      password: await bcrypt.hashSync('password', 10),
      name: 'Christian',
    },
  });

  // Send this to RabbitMQ for the other services to consume
  RmqHelper.publishEvent('owner.created', {
    data: user1,
    user: user1.id,
  });

  console.log('Seed data created:', { user1 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
