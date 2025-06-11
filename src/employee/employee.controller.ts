import { Controller, Inject } from '@nestjs/common';
import {
  ClientProxy,
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { Describe } from 'src/decorator/describe.decorator';
import { CustomResponse } from 'src/exception/dto/custom-response.dto';
import { EmployeeService } from './employee.service';
import { Exempt } from 'src/decorator/exempt.decorator';
import { RmqHelper } from 'src/helper/rmq.helper';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('employee')
export class EmployeeController {
  constructor(
    private readonly service: EmployeeService,
    private readonly prisma: PrismaService,
  ) {}

  @MessagePattern({ cmd: 'get:employee' })
  @Describe({
    description: 'Get all employee',
    fe: ['master/employee:open', 'settings/user-role:all'],
  })
  async findAll(@Payload() data: any): Promise<CustomResponse> {
    const filter = { owner_id: data.body.owner_id };
    const { page, limit, sort, search } = data.body;
    return this.service.findAll(filter, page, limit, sort, search);
  }

  @MessagePattern({ cmd: 'get:employee/*' })
  @Describe({
    description: 'Get a employee by id',
    fe: ['master/employee:edit', 'master/employee:detail'],
  })
  async findOne(@Payload() data: any): Promise<CustomResponse | null> {
    const param = data.params;
    return this.service.findOne(param.id);
  }

  @MessagePattern({ cmd: 'post:employee' })
  @Describe({
    description: 'Create a new employee',
    fe: ['master/employee:add'],
  })
  async create(@Payload() data: any): Promise<CustomResponse> {
    const createData = data.body;
    createData.owner_id = data.params.user.id;

    const response = await this.service.create(createData, data.params.user.id);
    // broadcast to other services via RMQ
    if (response.success) {
      RmqHelper.publishEvent('employee.created', {
        data: response.data,
        user: data.params.user.id,
      });
    }
    return response;
  }

  // Captured Event employee created
  @EventPattern('employee.created')
  @Exempt()
  async createReplica(@Payload() data: any, @Ctx() context: RmqContext) {
    await RmqHelper.handleMessageProcessing(
      context,
      async () => {
        console.log('Captured Employee Create Event', data);
        await this.service.createReplica(data.data, data.user);
      },
      {
        queueName: 'employee.created',
        useDLQ: true,
        dlqRoutingKey: 'dlq.employee.created',
        prisma: this.prisma,
      },
    )();
  }

  @MessagePattern({ cmd: 'put:employee/*' })
  @Describe({ description: 'Modify employee', fe: ['master/employee:edit'] })
  async update(@Payload() data: any): Promise<CustomResponse> {
    const param = data.params;
    const body = data.body;
    const response = await this.service.update(
      param.id,
      body,
      data.params.user.id,
    );
    if (response.success && body.password) {
      RmqHelper.publishEvent('employee.updated', {
        data: response.data,
        user: data.params.user.id,
      });
    }
    return response;
  }

  @EventPattern('employee.updated')
  @Exempt()
  async updateReplica(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('Captured Employee Update Event', data);
    await RmqHelper.handleMessageProcessing(
      context,
      async () => {
        return await this.service.update(data.data.id, data.data, data.user);
      },
      {
        queueName: 'employee.updated',
        useDLQ: true,
        dlqRoutingKey: 'dlq.employee.updated',
        prisma: this.prisma,
      },
    )();
  }

  @MessagePattern({ cmd: 'delete:employee/*' })
  @Describe({ description: 'Delete employee', fe: ['master/employee:delete'] })
  async delete(@Payload() data: any): Promise<CustomResponse> {
    const param = data.params;
    const response = await this.service.delete(param.id, data.params.user.id);
    if (response.success) {
      RmqHelper.publishEvent('employee.deleted', {
        data: response.data.id,
        user: data.params.user.id,
      });
    }
    return response;
  }

  @EventPattern('employee.deleted')
  @Exempt()
  async deleteReplica(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('Captured Employee Delete Event', data);
    await RmqHelper.handleMessageProcessing(
      context,
      async () => {
        return await this.service.delete(data);
      },
      {
        queueName: 'employee.deleted',
        useDLQ: true,
        dlqRoutingKey: 'dlq.employee.deleted',
        prisma: this.prisma,
      },
    )();
  }

  @EventPattern('password.changed')
  @Exempt()
  async passwordChanged(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    const sanitizedData = {
      ...data,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
      deleted_at: data.deleted_at ? new Date(data.deleted_at) : null,
    };

    try {
      const response = await this.service.passwordChanged(data);
      if (response.success) {
        channel.ack(originalMsg);
      }
    } catch (error) {
      console.error('Error processing password_changed event', error.stack);
      channel.nack(originalMsg);
      // Optional: Send the error message to a DLQ (Dead Letter Queue) or retry queue
    }
  }
}
