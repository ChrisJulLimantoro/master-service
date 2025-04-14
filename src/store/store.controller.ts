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
    @Inject('MARKETPLACE') private readonly marketplaceClient: ClientProxy,
    @Inject('INVENTORY') private readonly inventoryClient: ClientProxy,
    @Inject('TRANSACTION') private readonly transactionClient: ClientProxy,
    @Inject('FINANCE') private readonly financeClient: ClientProxy,
  ) {}

  @MessagePattern({ cmd: 'get:store' })
  @Describe({
    description: 'Get all store',
    fe: [
      'master/store:open',
      'settings/role:add',
      'settings/role:edit',
      'settings/role:detail',
      'transaction/sales:add',
      'transaction/sales:edit',
      'transaction/sales:detail',
      'master/account:add',
      'master/account:edit',
      'master/account:detail',
      'master/account:open',
    ],
  })
  async findAll(@Payload() data: any): Promise<CustomResponse> {
    var filter = {};
    const filterdata = data.body;
    const { page, limit, sort, search } = data.body;
    if (filterdata.company_id) {
      filter['company'] = { id: filterdata.company_id };
    } else {
      filter['company'] = { owner_id: filterdata.owner_id };
    }
    return this.service.findAll(filter, page, limit, sort, search);
  }

  @MessagePattern({ cmd: 'get:store/*' })
  @Describe({
    description: 'Get a store by id',
    fe: [
      'master/store:edit',
      'master/store:detail',
      'transaction/sales:add',
      'transaction/sales:edit',
      'transaction/sales:detail',
      'settings/change-store:all',
      'master/account:add',
      'master/account:edit',
      'master/account:detail',
      'master/account:open',
      'finance/mincomes:add',
      'finance/mincomes:edit',
      'finance/mincomes:detail',
      'finance/mincomes:open',
      'finance/mexpenses:add',
      'finance/mexpenses:edit',
      'finance/mexpenses:detail',
      'finance/mexpenses:open',
      'finance/recurring:add',
      'finance/recurring:edit',
      'finance/recurring:detail',
      'finance/recurring:open',
      'finance/profit-loss:open',
    ],
  })
  async findOne(@Payload() data: any): Promise<CustomResponse | null> {
    const param = data.params;
    return this.service.findOne(param.id);
  }

  @MessagePattern({ cmd: 'post:store' })
  @Describe({ description: 'Create a new store', fe: ['master/store:add'] })
  async create(@Payload() data: any): Promise<CustomResponse> {
    const createData = data.body;
    const response = await this.service.create(createData);

    if (response.success) {
      // broadcast to other services via RMQ
      this.authClient.emit({ cmd: 'store_created' }, response.data);
      this.inventoryClient.emit({ cmd: 'store_created' }, response.data);
      this.transactionClient.emit({ cmd: 'store_created' }, response.data);
      this.financeClient.emit({ cmd: 'store_created' }, response.data);
      this.marketplaceClient.emit(
        {
          service: 'marketplace',
          module: 'store',
          action: 'create',
        },
        response.data,
      );
    }
    return response;
  }

  @MessagePattern({ cmd: 'put:store/*' })
  @Describe({ description: 'Modify store', fe: ['master/store:edit'] })
  async update(@Payload() data: any): Promise<CustomResponse> {
    const param = data.params;
    const body = data.body;
    body.owner_id = param.user.userId;
    const response = await this.service.update(param.id, body);
    if (response.success) {
      if (body.code || body.name) {
        this.authClient.emit({ cmd: 'store_updated' }, response.data);
        this.inventoryClient.emit({ cmd: 'store_updated' }, response.data);
        this.transactionClient.emit({ cmd: 'store_updated' }, response.data);
        this.financeClient.emit({ cmd: 'store_updated' }, response.data);
        this.marketplaceClient.emit(
          {
            service: 'marketplace',
            module: 'store',
            action: 'update',
          },
          response.data,
        );
      }
    }
    return response;
  }

  @MessagePattern({ cmd: 'delete:store/*' })
  @Describe({ description: 'Delete store', fe: ['master/store:delete'] })
  async delete(@Payload() data: any): Promise<CustomResponse> {
    const param = data.params;

    const response = await this.service.delete(param.id);
    if (response.success) {
      this.authClient.emit({ cmd: 'store_deleted' }, response.data.id);
      this.inventoryClient.emit({ cmd: 'store_deleted' }, response.data.id);
      this.transactionClient.emit({ cmd: 'store_deleted' }, response.data.id);
      this.financeClient.emit({ cmd: 'store_deleted' }, response.data);
      this.marketplaceClient.emit(
        { service: 'marketplace', module: 'store', action: 'delete' },
        { id: response.data.id },
      );
    }
    return response;
  }
}
