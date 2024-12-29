import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Describe } from 'src/decorator/describe.decorator';
import { CustomResponse } from 'src/exception/dto/custom-response.dto';
import { CompanyService } from './company.service';

@Controller('company')
export class CompanyController {
  constructor(private readonly service: CompanyService) {}

  @MessagePattern({ cmd: 'get:company' })
  @Describe('Get all company')
  async findAll(): Promise<CustomResponse> {
    return this.service.findAll();
  }

  @MessagePattern({ cmd: 'get:company/*' })
  @Describe('Get a company by id')
  async findOne(@Payload() data: any): Promise<CustomResponse | null> {
    const param = data.params;
    return this.service.findOne(param.id);
  }

  @MessagePattern({ cmd: 'post:company' })
  @Describe('Create a new company')
  async create(@Payload() data: any): Promise<CustomResponse> {
    const createData = data.body;
    createData.owner_id = data.params.user.userId;
    return this.service.create(createData);
  }

  @MessagePattern({ cmd: 'put:company/*' })
  @Describe('Modify company')
  async update(@Payload() data: any): Promise<CustomResponse> {
    const param = data.params;
    const body = data.body;
    body.owner_id = param.user.userId;
    return this.service.update(param.id, body);
  }

  @MessagePattern({ cmd: 'delete:company/*' })
  @Describe('Delete company')
  async delete(@Payload() data: any): Promise<CustomResponse> {
    const param = data.params;
    return this.service.delete(param.id);
  }
}
