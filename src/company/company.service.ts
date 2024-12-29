import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/base.service';
import { CompanyRepository } from 'src/repositories/company.repository';
import { ValidationService } from 'src/validation/validation.service';
import { CreateCompanyRequest } from './dto/create-company.dto';

@Injectable()
export class CompanyService extends BaseService {
  protected repository = this.companyRepository;
  protected createSchema = CreateCompanyRequest.schema();
  protected updateSchema = CreateCompanyRequest.schema();

  constructor(
    private readonly companyRepository: CompanyRepository,
    protected readonly validation: ValidationService,
  ) {
    super(validation);
  }
}
