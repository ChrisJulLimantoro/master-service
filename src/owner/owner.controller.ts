import { Controller, Inject } from '@nestjs/common';
import {
  ClientProxy,
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { OwnerService } from './owner.service';
import { Describe } from 'src/decorator/describe.decorator';
import { CustomResponse } from 'src/exception/dto/custom-response.dto';
import { Exempt } from 'src/decorator/exempt.decorator';
import { RmqHelper } from 'src/helper/rmq.helper';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('owner')
export class OwnerController {
  constructor(
    private readonly service: OwnerService,
    private readonly prisma: PrismaService,
    @Inject('TRANSACTION') private readonly transactionClient: ClientProxy,
  ) {}

  @MessagePattern({ cmd: 'get:owner' })
  @Exempt()
  // @Describe('Get all owner')
  async findAll(): Promise<CustomResponse> {
    return this.service.findAll();
  }

  @MessagePattern({ cmd: 'get:owner/*' })
  @Exempt()
  async findOne(@Payload() data: any): Promise<CustomResponse | null> {
    return this.service.findOne(data.params.id);
  }

  @MessagePattern({ cmd: 'post:owner' })
  @Exempt()
  // @Describe('Create a new owner')
  async create(@Payload() data: any): Promise<CustomResponse> {
    const createData = data.body;
    const response = await this.service.create(createData, data.params.user.id);
    if (response.success) {
      RmqHelper.publishEvent('owner.created', response.data);
      // this.transactionClient.emit({ cmd: 'owner_created' }, response.data);
    }
    return response;
  }

  @EventPattern('owner.created')
  @Exempt()
  async createReplica(@Payload() data: any, @Ctx() context: RmqContext) {
    await RmqHelper.handleMessageProcessing(
      context,
      async () => {
        console.log('Captured Owner Create Event', data);
        await this.service.createReplica(data);
      },
      {
        queueName: 'owner.created',
        useDLQ: true,
        dlqRoutingKey: 'dlq.owner.created',
        prisma: this.prisma,
      },
    )();
  }

  @MessagePattern({ cmd: 'put:owner/*' })
  @Exempt()
  // @Describe('Modify owner')
  async update(@Payload() data: any): Promise<CustomResponse> {
    const param = data.params;
    const body = data.body;
    const response = await this.service.update(param.id, body, param.user.id);
    if (response.success) {
      //only if changing password emit to auth since auth only save the password and email
      if (body.password) {
        RmqHelper.publishEvent('owner.updated', response.data);
      }
      // this.transactionClient.emit({ cmd: 'owner_updated' }, response.data);
    }
    return response;
  }

  @EventPattern('owner.updated')
  @Exempt()
  async updateReplica(@Payload() data: any, @Ctx() context: RmqContext) {
    await RmqHelper.handleMessageProcessing(
      context,
      async () => {
        console.log('Captured Owner Update Event', data);
        await this.service.update(data.id, data);
      },
      {
        queueName: 'owner.updated',
        useDLQ: true,
        dlqRoutingKey: 'dlq.owner.updated',
        prisma: this.prisma,
      },
    )();
  }

  @MessagePattern({ cmd: 'delete:owner/*' })
  @Exempt()
  // @Describe('Delete owner')
  async delete(@Payload() data: any): Promise<CustomResponse> {
    const param = data.params;
    const response = await this.service.delete(param.id, param.user.id);
    if (response.success) {
      RmqHelper.publishEvent('owner.deleted', response.data);
      // this.transactionClient.emit({ cmd: 'owner_deleted' }, response.data.id);
    }
    return response;
  }

  @EventPattern('owner.deleted')
  @Exempt()
  async deleteReplica(@Payload() data: any, @Ctx() context: RmqContext) {
    await RmqHelper.handleMessageProcessing(
      context,
      async () => {
        console.log('Captured Owner Delete Event', data);
        await this.service.delete(data.id, data.user);
      },
      {
        queueName: 'owner.deleted',
        useDLQ: true,
        dlqRoutingKey: 'dlq.owner.deleted',
        prisma: this.prisma,
      },
    )();
  }
}
