import { Controller, Inject } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { OwnerService } from './owner.service';
import { Describe } from 'src/decorator/describe.decorator';
import { CustomResponse } from 'src/exception/dto/custom-response.dto';

@Controller('owner')
export class OwnerController {
  constructor(
    private readonly service: OwnerService,
    @Inject('AUTH') private readonly authClient: ClientProxy,
  ) {}

  @MessagePattern({ cmd: 'get:owner' })
  @Describe('Get all owner')
  async findAll(): Promise<CustomResponse> {
    return this.service.findAll();
  }

  @MessagePattern({ cmd: 'get:owner/*' })
  async findOne(@Payload() data: any): Promise<CustomResponse | null> {
    return this.service.findOne(data.params.id);
  }

  @MessagePattern({ cmd: 'post:owner' })
  @Describe('Create a new owner')
  async create(@Payload() data: any): Promise<CustomResponse> {
    const createData = data.body;
    const response = await this.service.create(createData);
    if (response.success) {
      this.authClient.emit({ cmd: 'owner_created' }, response.data);
    }
    return response;
  }

  @MessagePattern({ cmd: 'put:owner/*' })
  @Describe('Modify owner')
  async update(@Payload() data: any): Promise<CustomResponse> {
    const param = data.params;
    const body = data.body;
    const response = await this.service.update(param.id, body);
    if (response.success && body.password) {
      //only if changing password emit to auth since auth only save the password and email
      this.authClient.emit({ cmd: 'owner_updated' }, response.data);
    }
    return response;
  }

  @MessagePattern({ cmd: 'delete:owner/*' })
  @Describe('Delete owner')
  async delete(@Payload() data: any): Promise<CustomResponse> {
    const param = data.params;
    const response = await this.service.delete(param.id);
    if (response.success) {
      this.authClient.emit({ cmd: 'owner_deleted' }, response.data.id);
    }
    return response;
  }
}
