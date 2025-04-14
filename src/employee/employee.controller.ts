import { Controller, Inject } from '@nestjs/common';
import {
  ClientProxy,
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { Describe } from 'src/decorator/describe.decorator';
import { CustomResponse } from 'src/exception/dto/custom-response.dto';
import { EmployeeService } from './employee.service';
import { Exempt } from 'src/decorator/exempt.decorator';

@Controller('employee')
export class EmployeeController {
  constructor(
    private readonly service: EmployeeService,
    @Inject('AUTH') private readonly authClient: ClientProxy,
    @Inject('TRANSACTION') private readonly transactionClient: ClientProxy,
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
      this.authClient.emit({ cmd: 'employee_created' }, response.data);
      this.transactionClient.emit({ cmd: 'employee_created' }, response.data);
    }
    return response;
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
      this.authClient.emit({ cmd: 'employee_updated' }, response.data);
      this.transactionClient.emit({ cmd: 'employee_updated' }, response.data);
    }
    return response;
  }

  @MessagePattern({ cmd: 'delete:employee/*' })
  @Describe({ description: 'Delete employee', fe: ['master/employee:delete'] })
  async delete(@Payload() data: any): Promise<CustomResponse> {
    const param = data.params;
    const response = await this.service.delete(param.id, data.params.user.id);
    if (response.success) {
      this.authClient.emit({ cmd: 'employee_deleted' }, response.data.id);
      this.transactionClient.emit(
        { cmd: 'employee_deleted' },
        response.data.id,
      );
    }
    return response;
  }

  @MessagePattern({ cmd: 'password_changed' })
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
