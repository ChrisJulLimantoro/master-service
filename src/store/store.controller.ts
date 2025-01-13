import { Controller, Inject } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { Describe } from 'src/decorator/describe.decorator';
import { CustomResponse } from 'src/exception/dto/custom-response.dto';
import { StoreService } from './store.service';

@Controller('store')
export class StoreController {
  constructor(
    private readonly service: StoreService,
    @Inject('AUTH') private readonly authClient: ClientProxy,
  ) {}

  @MessagePattern({ cmd: 'get:store' })
  @Describe('Get all store')
  async findAll(): Promise<CustomResponse> {
    return this.service.findAll();
  }

  @MessagePattern({ cmd: 'get:store/*' })
  @Describe('Get a store by id')
  async findOne(@Payload() data: any): Promise<CustomResponse | null> {
    const param = data.params;
    return this.service.findOne(param.id);
  }

  @MessagePattern({ cmd: 'post:store' })
  @Describe('Create a new store')
  async create(@Payload() data: any): Promise<CustomResponse> {
    const createData = data.body;
    createData.owner_id = data.params.user.userId;
    const response = await this.service.create(createData);

    if (response.success) {
      // broadcast to other services via RMQ
      this.authClient.emit({ cmd: 'store_created' }, response.data);
    }
    return response;
  }

  @MessagePattern({ cmd: 'put:store/*' })
  @Describe('Modify store')
  async update(@Payload() data: any): Promise<CustomResponse> {
    const param = data.params;
    const body = data.body;
    body.owner_id = param.user.userId;

    const response = await this.service.update(param.id, body);
    if (response.success && (body.code || body.name)) {
      this.authClient.emit({ cmd: 'store_updated' }, response.data);
    }
    return response;
  }

  @MessagePattern({ cmd: 'delete:store/*' })
  @Describe('Delete store')
  async delete(@Payload() data: any): Promise<CustomResponse> {
    const param = data.params;

    const response = await this.service.delete(param.id);
    if (response.success) {
      this.authClient.emit({ cmd: 'store_deleted' }, response.data.id);
    }
    return response;
  }
}
