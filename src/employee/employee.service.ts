import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/base.service';
import { ValidationService } from 'src/validation/validation.service';
import { CreateEmployeeRequest } from './dto/create-employee.dto';
import { UpdateEmployeeRequest } from './dto/update-employee.dto';
import { EmployeeRepository } from 'src/repositories/employee.repository';

@Injectable()
export class EmployeeService extends BaseService {
  protected repository = this.employeeRepository;
  protected createSchema = CreateEmployeeRequest.schema();
  protected updateSchema = UpdateEmployeeRequest.schema();

  constructor(
    private readonly employeeRepository: EmployeeRepository,
    protected readonly validation: ValidationService,
  ) {
    super(validation);
  }
}
