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
  @Describe('Get all store')
  async findAll(@Payload() data: any): Promise<CustomResponse> {
    const filter = data.body;
    return this.service.findAll(filter);
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
      this.inventoryClient.emit({ cmd: 'store_created' }, response.data);
      this.transactionClient.emit({ cmd: 'store_created' }, response.data);
      this.financeClient.emit({ cmd: 'store_created' }, response.data);
      try {
        console.log('Notifying marketplace...');
        await this.service.notifyMarketplace(response.data);
        console.log('Marketplace notified successfully.');
      } catch (error) {
        console.error('Error notifying marketplace:', error.message);
      }
    }
    return response;
  }

  @MessagePattern({ cmd: 'put:store/*' })
  @Describe('Modify store')
  async update(@Payload() data: any): Promise<CustomResponse> {
    const param = data.params;
    const body = data.body;
    body.owner_id = param.user.userId;
    const isOnlyNpwpAndOpenDateUpdated = Object.keys(body).every((key) =>
      ['npwp', 'open_date'].includes(key),
    );
    const response = await this.service.update(param.id, body);
    if (response.success) {
      if (body.code || body.name) {
        this.authClient.emit({ cmd: 'store_updated' }, response.data);
        this.inventoryClient.emit({ cmd: 'store_updated' }, response.data);
        this.transactionClient.emit({ cmd: 'store_updated' }, response.data);
        if (!isOnlyNpwpAndOpenDateUpdated) {
          try {
            console.log('Notifying marketplace...');
            await this.service.notifyMarketplaceUpdate(param.id, response.data);
            console.log('Marketplace notified successfully.');
          } catch (error) {
            console.error('Error notifying marketplace:', error.message);
          }
        }
      }
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
      this.inventoryClient.emit({ cmd: 'store_deleted' }, response.data.id);
      this.transactionClient.emit({ cmd: 'store_deleted' }, response.data.id);
      this.marketplaceClient.emit(
        { service: 'marketplace', module: 'store', action: 'delete' },
        { id: response.data.id },
      );
    }
    return response;
  }
}
