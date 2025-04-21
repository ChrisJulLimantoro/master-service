import { Controller, Inject } from '@nestjs/common';
import {
  ClientProxy,
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { Describe } from 'src/decorator/describe.decorator';
import { CustomResponse } from 'src/exception/dto/custom-response.dto';
import { StoreService } from './store.service';
import { RmqHelper } from 'src/helper/rmq.helper';
import { Exempt } from 'src/decorator/exempt.decorator';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('store')
export class StoreController {
  constructor(
    private readonly service: StoreService,
    private readonly prisma: PrismaService,
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
    const response = await this.service.create(createData, data.params.user.id);

    if (response.success) {
      // broadcast to other services via RMQ
      RmqHelper.publishEvent('store.created', response.data);
    }
    return response;
  }

  @EventPattern('store.created')
  @Exempt()
  async createReplica(@Payload() data: any, @Ctx() context: RmqContext) {
    await RmqHelper.handleMessageProcessing(
      context,
      async () => {
        console.log('Captured Store Create Event', data);
        await this.service.createReplica(data);
      },
      {
        queueName: 'store.created',
        useDLQ: true,
        dlqRoutingKey: 'dlq.store.created',
        prisma: this.prisma,
      },
    )();
  }

  @MessagePattern({ cmd: 'put:store/*' })
  @Describe({ description: 'Modify store', fe: ['master/store:edit'] })
  async update(@Payload() data: any): Promise<CustomResponse> {
    const param = data.params;
    const body = data.body;
    body.owner_id = param.user.userId;
    const response = await this.service.update(
      param.id,
      body,
      data.params.user.id,
    );
    if (response.success) {
      if (body.code || body.name) {
        RmqHelper.publishEvent('store.updated', response.data);
      }
    }
    return response;
  }

  @EventPattern('store.updated')
  @Exempt()
  async updateReplica(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('Captured Store Update Event', data);
    await RmqHelper.handleMessageProcessing(
      context,
      async () => {
        return await this.service.update(data.id, data);
      },
      {
        queueName: 'store.updated',
        useDLQ: true,
        dlqRoutingKey: 'dlq.store.updated',
        prisma: this.prisma,
      },
    )();
  }

  @MessagePattern({ cmd: 'delete:store/*' })
  @Describe({ description: 'Delete store', fe: ['master/store:delete'] })
  async delete(@Payload() data: any): Promise<CustomResponse> {
    const param = data.params;

    const response = await this.service.delete(param.id, data.params.user.id);
    if (response.success) {
      RmqHelper.publishEvent('store.deleted', response.data.id);
    }
    return response;
  }

  @EventPattern('store.deleted')
  @Exempt()
  async deleteReplica(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('Captured Store Delete Event', data);
    await RmqHelper.handleMessageProcessing(
      context,
      async () => {
        return await this.service.delete(data);
      },
      {
        queueName: 'store.deleted',
        useDLQ: true,
        dlqRoutingKey: 'dlq.store.deleted',
        prisma: this.prisma,
      },
    )();
  }
}
