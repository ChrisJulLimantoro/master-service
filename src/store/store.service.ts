import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/base.service';
import { StoreRepository } from 'src/repositories/store.repository';
import { ValidationService } from 'src/validation/validation.service';
import { CreateStoreRequest } from './dto/create-store.dto';
import { UpdateStoreRequest } from './dto/update-store.dto';
import { CustomResponse } from 'src/exception/dto/custom-response.dto';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class StoreService extends BaseService {
  protected repository = this.storeRepository;
  protected createSchema = CreateStoreRequest.schema();
  protected updateSchema = UpdateStoreRequest.schema();

  constructor(
    private readonly storeRepository: StoreRepository,
    protected readonly validation: ValidationService,
    private readonly httpService: HttpService,
  ) {
    super(validation);
  }

  protected transformCreateData(data: any) {
    return new CreateStoreRequest(data);
  }

  protected transformUpdateData(data: any) {
    return new UpdateStoreRequest(data);
  }

  async create(data: any, user_id?: string): Promise<CustomResponse> {
    data.code = data.code.toUpperCase();
    return super.create(data, user_id);
  }

  async notifyMarketplace(storeData: any): Promise<any> {
    const apiGatewayUrl = 'http://127.0.0.1:3001/api/store';

    try {
      const response = await lastValueFrom(
        this.httpService.post(apiGatewayUrl, storeData),
      );
      console.log('Marketplace response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error calling API Gateway Marketplace:', error.message);
      throw error;
    }
  }

  async notifyMarketplaceUpdate(store_id: any, storeData: any): Promise<any> {
    const apiGatewayUrl = `http://127.0.0.1:3001/api/store/${store_id}`;

    try {
      const response = await lastValueFrom(
        this.httpService.patch(apiGatewayUrl, storeData),
      );
      console.log('Marketplace response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error calling API Gateway Marketplace:', error.message);
      throw error;
    }
  }
}
