import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/base.service';
import { ValidationService } from 'src/validation/validation.service';
import { CreateOwnerRequest } from './dto/create-owner.dto';
import { UpdateOwnerRequest } from './dto/update-owner.dto';
import { OwnerRepository } from 'src/repositories/owner.repository';

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
}
