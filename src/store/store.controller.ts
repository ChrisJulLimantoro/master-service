import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Describe } from 'src/decorator/describe.decorator';
import { CustomResponse } from 'src/exception/dto/custom-response.dto';
import { StoreService } from './store.service';

@Controller('store')
export class StoreController {
  constructor(private readonly service: StoreService) {}

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
    return this.service.create(createData);
  }

  @MessagePattern({ cmd: 'put:store/*' })
  @Describe('Modify store')
  async update(@Payload() data: any): Promise<CustomResponse> {
    const param = data.params;
    const body = data.body;
    body.owner_id = param.user.userId;
    return this.service.update(param.id, body);
  }

  @MessagePattern({ cmd: 'delete:store/*' })
  @Describe('Delete store')
  async delete(@Payload() data: any): Promise<CustomResponse> {
    const param = data.params;
    return this.service.delete(param.id);
  }
}
