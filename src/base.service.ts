import { Injectable } from '@nestjs/common';
import { CustomResponse } from './exception/dto/custom-response.dto';
import { ValidationService } from './validation/validation.service';

export abstract class BaseService {
  // Abstract repository, which will be defined by the child service
  protected abstract repository: any;
  protected abstract createSchema: any;
  protected abstract updateSchema: any;

  constructor(protected readonly validation: ValidationService) {}

  // Create
  async create(data: any): Promise<CustomResponse> {
    const validatedData = this.validation.validate(data, this.createSchema);
    const newData = await this.repository.create(validatedData);
    return CustomResponse.success('New Data Created!', newData, 201);
  }

  // Find all
  async findAll(): Promise<CustomResponse> {
    const data = await this.repository.findAll();
    return CustomResponse.success('Data Found!', data, 200);
  }

  // Find one by ID
  async findOne(id: string): Promise<CustomResponse | null> {
    const data = await this.repository.findOne(id);
    if (!data) {
      return CustomResponse.error('Data not found', null, 404);
    }
    return CustomResponse.success('Data found!', data, 200);
  }

  // Update
  async update(id: string, data: any): Promise<CustomResponse> {
    const oldData = await this.repository.findOne(id);
    if (!oldData) {
      return CustomResponse.error('Data not found', null, 404);
    }
    const validatedData = this.validation.validate(data, this.updateSchema);
    const newData = await this.repository.update(id, validatedData);
    return CustomResponse.success('Data Updated!', newData, 200);
  }

  // Delete
  async delete(id: string): Promise<CustomResponse> {
    const data = await this.repository.findOne(id);
    if (!data) {
      return CustomResponse.error('Data not found', null, 404);
    }
    await this.repository.delete(id);
    return CustomResponse.success('Data deleted!', data, 200);
  }
}
