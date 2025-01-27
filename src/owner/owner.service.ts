import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/base.service';
import { ValidationService } from 'src/validation/validation.service';
import { CreateOwnerRequest } from './dto/create-owner.dto';
import { UpdateOwnerRequest } from './dto/update-owner.dto';
import { OwnerRepository } from 'src/repositories/owner.repository';
import * as bcrypt from 'bcrypt';
import { CustomResponse } from 'src/exception/dto/custom-response.dto';

@Injectable()
export class OwnerService extends BaseService {
  protected repository = this.ownerRepository;
  protected createSchema = CreateOwnerRequest.schema();
  protected updateSchema = UpdateOwnerRequest.schema();

  constructor(
    private readonly ownerRepository: OwnerRepository,
    protected readonly validation: ValidationService,
  ) {
    super(validation);
  }

  protected transformCreateData(data: any) {
    return new CreateOwnerRequest(data);
  }

  protected transformUpdateData(data: any) {
    return new UpdateOwnerRequest(data);
  }

  async create(data: any) {
    data = this.transformCreateData(data);
    const validatedData = this.validation.validate(data, this.createSchema);
    validatedData.password = await bcrypt.hash(validatedData.password, 10);
    const newData = await this.repository.create(validatedData);
    if (!newData) {
      return CustomResponse.error('Failed to create new data', null, 500);
    }
    return CustomResponse.success('New Data Created!', newData, 201);
  }

  async update(id: string, data: any) {
    data = this.transformUpdateData(data);
    const oldData = await this.repository.findOne(id);
    if (!oldData) {
      return CustomResponse.error('Data not found', null, 404);
    }
    const validatedData = this.validation.validate(data, this.updateSchema);
    if (validatedData.password) {
      validatedData.password = await bcrypt.hash(validatedData.password, 10);
    }
    const newData = await this.repository.update(id, validatedData);
    return CustomResponse.success('Data Updated!', newData, 200);
  }
}
