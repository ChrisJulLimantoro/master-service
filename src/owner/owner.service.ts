import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/base.service';
import { ValidationService } from 'src/validation/validation.service';
import { CreateOwnerRequest } from './dto/create-owner.dto';
import { UpdateOwnerRequest } from './dto/update-owner.dto';
import { OwnerRepository } from 'src/repositories/owner.repository';
import * as bcrypt from 'bcrypt';
import { CustomResponse } from 'src/exception/dto/custom-response.dto';
import * as nodemailer from 'nodemailer';

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

  async create(data: any, user_id?: string): Promise<CustomResponse> {
    data = this.transformCreateData(data);
    const validatedData = this.validation.validate(data, this.createSchema);
    validatedData.password = await bcrypt.hash(validatedData.password, 10);
    const newData = await this.repository.create(validatedData, user_id);
    console.log(validatedData);
    if (!newData) {
      return CustomResponse.error('Failed to create new data', null, 500);
    }
    await this.sendPasswordEmail(validatedData.email, data.password);
    return CustomResponse.success('New Data Created!', newData, 201);
  }

  private async sendPasswordEmail(email: string, password: string) {
    console.log(process.env.EMAIL); // Untuk debugging

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
      },
    });

    // Mengirimkan email dengan password baru
    await transporter.sendMail({
      to: email,
      subject: 'Your Account Details',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #555;">Welcome to Our Platform,</h2>
          <p>Hi ${email.split('@')[0]},</p>
          <p>Thank you for registering with us! To complete your registration, your generated password is:</p>
          <h3 style="color: #007BFF;">${password}</h3>
          <p>Please use this password to log in and change it after your first login for security reasons.</p>
          <p>If you did not sign up for this account, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 12px; color: #777;">
            Need help? Contact us at support@example.com
          </p>
        </div>
      `,
    });

    console.log('Password email sent to:', email); // Logging email yang dikirim
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
}
