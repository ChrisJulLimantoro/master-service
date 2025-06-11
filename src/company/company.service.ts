import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/base.service';
import { CompanyRepository } from 'src/repositories/company.repository';
import { ValidationService } from 'src/validation/validation.service';
import { CreateCompanyRequest } from './dto/create-company.dto';
import { UpdateCompanyRequest } from './dto/update-company.dto';
import { CustomResponse } from 'src/exception/dto/custom-response.dto';

@Injectable()
export class CompanyService extends BaseService {
  protected repository = this.companyRepository;
  protected createSchema = CreateCompanyRequest.schema();
  protected updateSchema = UpdateCompanyRequest.schema();

  constructor(
    private readonly companyRepository: CompanyRepository,
    protected readonly validation: ValidationService,
  ) {
    super(validation);
  }

  protected transformCreateData(data: any) {
    return new CreateCompanyRequest(data);
  }

  protected transformUpdateData(data: any) {
    return new UpdateCompanyRequest(data);
  }

  async create(data: any, user_id?: string): Promise<CustomResponse> {
    data.code = data.code.toUpperCase();
    return super.create(data, user_id);
  }
  async findAllEmails(company_id): Promise<CustomResponse> {
    const data = await this.companyRepository.findAllEmails(company_id);
    return CustomResponse.success('Get all company emails success', data);
  }
}
