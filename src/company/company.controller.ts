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
import { CompanyService } from './company.service';
import { RmqHelper } from 'src/helper/rmq.helper';
import { Exempt } from 'src/decorator/exempt.decorator';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('company')
export class CompanyController {
  constructor(
    private readonly service: CompanyService,
    private readonly prisma: PrismaService,
  ) {}

  @MessagePattern({ cmd: 'get:company' })
  @Describe({
    description: 'Get all company',
    fe: [
      'master/company:open',
      'master/store:open',
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
    const { page, limit, sort, search } = data.body;
    const allowedFilter = ['name', 'owner_id']; // protection from SQL injection
    Object.keys(filter).forEach((key) => {
      if (!allowedFilter.includes(key)) {
        delete filter[key];
      }
    });
    return this.service.findAll(filter, page, limit, sort, search);
  }

  @MessagePattern({ cmd: 'get:company/*' })
  @Describe({
    description: 'Get a company by id',
    fe: [
      'master/company:edit',
      'master/company:detail',
      'master/account:detail',
      'master/account:open',
      'master/account:edit',
      'master/account:add',
    ],
  })
  async findOne(@Payload() data: any): Promise<CustomResponse | null> {
    const param = data.params;
    return this.service.findOne(param.id);
  }

  @MessagePattern({ cmd: 'post:company' })
  @Describe({ description: 'Create a new company', fe: ['master/company:add'] })
  async create(@Payload() data: any): Promise<CustomResponse> {
    const createData = data.body;

    const response = await this.service.create(createData, data.params.user.id);
    // broadcast to other services via RMQ
    if (response.success) {
      RmqHelper.publishEvent('company.created', {
        data: response.data,
        user: data.params.user.id,
      });
    }
    return response;
  }

  // Captured Event company created
  @EventPattern('company.created')
  @Exempt()
  async createReplica(@Payload() data: any, @Ctx() context: RmqContext) {
    await RmqHelper.handleMessageProcessing(
      context,
      async () => {
        console.log('Captured Company Create Event', data);
        await this.service.createReplica(data.data, data.user);
      },
      {
        queueName: 'company.created',
        useDLQ: true,
        dlqRoutingKey: 'dlq.company.created',
        prisma: this.prisma,
      },
    )();
  }

  @MessagePattern({ cmd: 'put:company/*' })
  @Describe({ description: 'Modify company', fe: ['master/company:edit'] })
  async update(@Payload() data: any): Promise<CustomResponse> {
    const param = data.params;
    const body = data.body;
    const response = await this.service.update(
      param.id,
      body,
      data.params.user.id,
    );
    if (response.success) {
      RmqHelper.publishEvent('company.updated', {
        data: response.data,
        user: param.user.id,
      });
    }
    return response;
  }

  @EventPattern('company.updated')
  @Exempt()
  async updateReplica(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('Captured Company Update Event', data);
    await RmqHelper.handleMessageProcessing(
      context,
      async () => {
        return await this.service.update(data.data.id, data.data, data.user);
      },
      {
        queueName: 'company.updated',
        useDLQ: true,
        dlqRoutingKey: 'dlq.company.updated',
        prisma: this.prisma,
      },
    )();
  }

  @MessagePattern({ cmd: 'delete:company/*' })
  @Describe({ description: 'Delete company', fe: ['master/company:delete'] })
  async delete(@Payload() data: any): Promise<CustomResponse> {
    const param = data.params;
    const response = await this.service.delete(param.id, data.params.user.id);
    if (response.success) {
      RmqHelper.publishEvent('company.deleted', {
        data: response.data.id,
        user: param.user.id,
      });
    }
    return response;
  }

  @MessagePattern({ cmd: 'get:company-emails' })
  @Exempt()
  async findAllEmails(@Payload() data: any): Promise<CustomResponse | null> {
    return this.service.findAllEmails(data.body.auth.company_id);
  }

  @EventPattern('company.deleted')
  @Exempt()
  async deleteReplica(@Payload() data: any, @Ctx() context: RmqContext) {
    console.log('Captured Company Delete Event', data);
    await RmqHelper.handleMessageProcessing(
      context,
      async () => {
        return await this.service.delete(data.data, data.user);
      },
      {
        queueName: 'company.deleted',
        useDLQ: true,
        dlqRoutingKey: 'dlq.company.deleted',
        prisma: this.prisma,
      },
    )();
  }
}
