import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { RPCExceptionFilter } from './exception/rpc-exception.filter';
import { RmqHelper } from './helper/rmq.helper';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new RPCExceptionFilter());

  // TCP Microservice
  const tcpOptions: MicroserviceOptions = {
    transport: Transport.TCP,
    options: {
      host: process.env.TCP_HOST || 'localhost',
      port: Number(process.env.TCP_PORT ?? '3001'),
    },
  };
  const tcpService = app.connectMicroservice(tcpOptions);

  // RabbitMQ Microservice
  const queueName = process.env.RMQ_QUEUE_NAME || 'auth_service_queue_1';
  const rmqOptions: MicroserviceOptions = {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RMQ_URL || 'amqp://localhost:5672'],
      queue: queueName,
      noAck: false,
      queueOptions: { durable: true },
    },
  };
  const rmqService = app.connectMicroservice(rmqOptions);
  // Setup the topic exhange
  const routingKeys = [
    'password.changed',
    'company.*',
    'store.*',
    'owner.*',
    'employee.*',
  ];
  await RmqHelper.setupSubscriptionQueue(queueName, routingKeys);

  await app.startAllMicroservices();
  console.log('All microservices started successfully');
}
bootstrap();
