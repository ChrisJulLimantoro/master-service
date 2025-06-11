import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/base.service';
import { ValidationService } from 'src/validation/validation.service';
import { CreateEmployeeRequest } from './dto/create-employee.dto';
import { UpdateEmployeeRequest } from './dto/update-employee.dto';
import { EmployeeRepository } from 'src/repositories/employee.repository';
import { CustomResponse } from 'src/exception/dto/custom-response.dto';
import * as bcrypt from 'bcrypt';
import { OwnerRepository } from 'src/repositories/owner.repository';

@Injectable()
export class EmployeeService extends BaseService {
  protected repository = this.employeeRepository;
  protected createSchema = CreateEmployeeRequest.schema();
  protected updateSchema = UpdateEmployeeRequest.schema();

  constructor(
    private readonly employeeRepository: EmployeeRepository,
    private readonly ownerRepository: OwnerRepository,
    protected readonly validation: ValidationService,
  ) {
    super(validation);
  }

  protected transformCreateData(data: any) {
    return new CreateEmployeeRequest(data);
  }

  protected transformUpdateData(data: any) {
    return new UpdateEmployeeRequest(data);
  }

  async create(data: any, user_id?: string) {
    data = this.transformCreateData(data);
    const validatedData = this.validation.validate(data, this.createSchema);
    validatedData.password = await bcrypt.hash('password', 10);
    const newData = await this.repository.create(validatedData, user_id);
    if (!newData) {
      return CustomResponse.error('Failed to create new data', null, 500);
    }
    return CustomResponse.success('New Data Created!', newData, 201);
  }

  async update(id: string, data: any, user_id?: string) {
    data = this.transformUpdateData(data);
    const oldData = await this.repository.findOne(id);
    if (!oldData) {
      return CustomResponse.error('Data not found', null, 404);
    }
    const validatedData = this.validation.validate(data, this.updateSchema);
    if (validatedData.password) {
      validatedData.password = await bcrypt.hash(validatedData.password, 10);
    }
    const newData = await this.repository.update(id, validatedData, user_id);
    return CustomResponse.success('Data Updated!', newData, 200);
  }

  async passwordChanged(data: any) {
    const employee = await this.employeeRepository.findOne(data.id);
    var res = null;
    if (employee) {
      res = await this.employeeRepository.update(data.id, {
        password: data.password,
      });
    } else {
      const owner = await this.ownerRepository.findOne(data.id);
      if (!owner) {
        return CustomResponse.error('User not found', null, 404);
      }
      res = await this.ownerRepository.update(data.id, {
        password: data.password,
      });
    }
    return CustomResponse.success('Password changed!', res, 200);
  }
}
