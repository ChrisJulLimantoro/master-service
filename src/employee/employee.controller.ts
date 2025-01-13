import { Controller, Inject } from '@nestjs/common';
import { ClientProxy, MessagePattern, Payload } from '@nestjs/microservices';
import { Describe } from 'src/decorator/describe.decorator';
import { CustomResponse } from 'src/exception/dto/custom-response.dto';
import { EmployeeService } from './employee.service';

@Controller('employee')
export class EmployeeController {
  constructor(
    private readonly service: EmployeeService,
    @Inject('AUTH') private readonly authClient: ClientProxy,
  ) {}

  @MessagePattern({ cmd: 'get:employee' })
  @Describe('Get all employee')
  async findAll(): Promise<CustomResponse> {
    return this.service.findAll();
  }

  @MessagePattern({ cmd: 'get:employee/*' })
  @Describe('Get a employee by id')
  async findOne(@Payload() data: any): Promise<CustomResponse | null> {
    const param = data.params;
    return this.service.findOne(param.id);
  }

  @MessagePattern({ cmd: 'post:employee' })
  @Describe('Create a new employee')
  async create(@Payload() data: any): Promise<CustomResponse> {
    const createData = data.body;
    createData.owner_id = data.params.user.id;

    const response = await this.service.create(createData);
    // broadcast to other services via RMQ
    if (response.success) {
      this.authClient.emit({ cmd: 'employee_created' }, response.data);
    }
    return response;
  }

  @MessagePattern({ cmd: 'put:employee/*' })
  @Describe('Modify employee')
  async update(@Payload() data: any): Promise<CustomResponse> {
    const param = data.params;
    const body = data.body;
    const response = await this.service.update(param.id, body);
    if (response.success && body.password) {
      this.authClient.emit({ cmd: 'employee_updated' }, response.data);
    }
    return response;
  }

  @MessagePattern({ cmd: 'delete:employee/*' })
  @Describe('Delete employee')
  async delete(@Payload() data: any): Promise<CustomResponse> {
    const param = data.params;
    const response = await this.service.delete(param.id);
    if (response.success) {
      this.authClient.emit({ cmd: 'employee_deleted' }, response.data.id);
    }
    return response;
  }
}
