import { Controller, Inject } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { OwnerService } from './owner.service';
import { Describe } from 'src/decorator/describe.decorator';
import { CustomResponse } from 'src/exception/dto/custom-response.dto';
import { Exempt } from 'src/decorator/exempt.decorator';

@Controller('owner')
export class OwnerController {
  constructor(
    private readonly service: OwnerService,
    @Inject('AUTH') private readonly authClient: ClientProxy,
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
      this.authClient.emit({ cmd: 'owner_created' }, response.data);
      this.transactionClient.emit({ cmd: 'owner_created' }, response.data);
    }
    return response;
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
        this.authClient.emit({ cmd: 'owner_updated' }, response.data);
      }
      this.transactionClient.emit({ cmd: 'owner_updated' }, response.data);
    }
    return response;
  }

  @MessagePattern({ cmd: 'delete:owner/*' })
  @Exempt()
  // @Describe('Delete owner')
  async delete(@Payload() data: any): Promise<CustomResponse> {
    const param = data.params;
    const response = await this.service.delete(param.id, param.user.id);
    if (response.success) {
      this.authClient.emit({ cmd: 'owner_deleted' }, response.data.id);
      this.transactionClient.emit({ cmd: 'owner_deleted' }, response.data.id);
    }
    return response;
  }
}
