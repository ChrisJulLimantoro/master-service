import { PrismaClient } from '@prisma/client';
import * as amqp from 'amqplib';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function publishEvent(cmd: string, payload: any) {
  const conn = await amqp.connect(
    process.env.RMQ_URL || 'amqp://localhost:5672',
  );
  const ch = await conn.createChannel();

  const exchange = process.env.RMQ_EXCHANGE || 'events_broadcast';
  const routingKey = cmd; // already formatted like 'product.created'

  const message = {
    pattern: cmd,
    data: payload,
  };

  await ch.assertExchange(exchange, 'topic', { durable: true });
  ch.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)), {
    headers: {
      'x-retry-count': 0,
      'origin-queue': 'master_service_queue_1',
    },
  });

  await ch.close();
  await conn.close();
}

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
  publishEvent('owner.created', {
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
