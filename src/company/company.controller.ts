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
    @Inject('FINANCE') private readonly financeClient: ClientProxy,
  ) {}

  @MessagePattern({ cmd: 'get:company' })
  @Describe({
    description: 'Get all company',
    fe: [
      'master/company:open',
      'master/store:add',
      'master/store:edit',
      'master/store:detail',
      'master/category:add',
      'master/category:edit',
      'master/category:detail',
      'settings/role:add',
      'master/account:detail',
      'master/account:edit',
      'master/account:add',
      'master/account:open',
      'finance/mincomes:add',
      'finance/mincomes:edit',
      'finance/mincomes:detail',
      'finance/mincomes:open',
      'finance/mexpenses:add',
      'finance/mexpenses:edit',
      'finance/mexpenses:detail',
      'finance/mexpenses:open',
      'finance/profit-loss:open',
    ],
  })
  async findAll(@Payload() data: any): Promise<CustomResponse> {
    const filter = data.body;
    const allowedFilter = ['name', 'owner_id']; // protection from SQL injection
    Object.keys(filter).forEach((key) => {
      if (!allowedFilter.includes(key)) {
        delete filter[key];
      }
    });
    return this.service.findAll(filter);
  }

  @MessagePattern({ cmd: 'get:company/*' })
  @Describe({
    description: 'Get a company by id',
    fe: ['master/company:edit', 'master/company:detail','master/account:detail','master/account:open','master/account:edit','master/account:add'],
  })
  async findOne(@Payload() data: any): Promise<CustomResponse | null> {
    const param = data.params;
    return this.service.findOne(param.id);
  }

  @MessagePattern({ cmd: 'post:company' })
  @Describe({ description: 'Create a new company', fe: ['master/company:add'] })
  async create(@Payload() data: any): Promise<CustomResponse> {
    const createData = data.body;

    const response = await this.service.create(createData);
    // broadcast to other services via RMQ
    if (response.success) {
      this.authClient.emit({ cmd: 'company_created' }, response.data);
      this.inventoryClient.emit({ cmd: 'company_created' }, response.data);
      this.transactionClient.emit({ cmd: 'company_created' }, response.data);
      this.financeClient.emit({ cmd: 'company_created' }, response.data);
    }
    return response;
  }

  @MessagePattern({ cmd: 'put:company/*' })
  @Describe({ description: 'Modify company', fe: ['master/company:edit'] })
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
  @Describe({ description: 'Delete company', fe: ['master/company:delete'] })
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
