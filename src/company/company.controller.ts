import { Controller, Inject } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { Describe } from 'src/decorator/describe.decorator';
import { CustomResponse } from 'src/exception/dto/custom-response.dto';
import { CompanyService } from './company.service';

@Controller('company')
export class CompanyController {
  constructor(
    private readonly service: CompanyService,
    @Inject('AUTH') private readonly authClient: ClientProxy,
    @Inject('INVENTORY') private readonly inventoryClient: ClientProxy,
    @Inject('TRANSACTION') private readonly transactionClient: ClientProxy,
  ) {}

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
    console.log(data.params);
    createData.owner_id = data.params.user.id;

    const response = await this.service.create(createData);
    // broadcast to other services via RMQ
    if (response.success) {
      this.authClient.emit({ cmd: 'company_created' }, response.data);
      this.inventoryClient.emit({ cmd: 'company_created' }, response.data);
      this.transactionClient.emit({ cmd: 'company_created' }, response.data);
    }
    return response;
  }

  @MessagePattern({ cmd: 'put:company/*' })
  @Describe('Modify company')
  async update(@Payload() data: any): Promise<CustomResponse> {
    const param = data.params;
    const body = data.body;
    const response = await this.service.update(param.id, body);
    if (response.success) {
      this.authClient.emit({ cmd: 'company_updated' }, response.data);
      this.inventoryClient.emit({ cmd: 'company_updated' }, response.data);
      this.transactionClient.emit({ cmd: 'company_updated' }, response.data);
    }
    return response;
  }

  @MessagePattern({ cmd: 'delete:company/*' })
  @Describe('Delete company')
  async delete(@Payload() data: any): Promise<CustomResponse> {
    const param = data.params;
    const response = await this.service.delete(param.id);
    if (response.success) {
      this.authClient.emit({ cmd: 'company_deleted' }, response.data.id);
      this.inventoryClient.emit({ cmd: 'company_deleted' }, response.data.id);
      this.transactionClient.emit({ cmd: 'company_deleted' }, response.data.id);
    }
    return response;
  }
}
