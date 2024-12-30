import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { CompanyRepository } from 'src/repositories/company.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { ValidationModule } from 'src/validation/validation.module';
import { SharedModule } from 'src/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [CompanyController],
  providers: [
    CompanyService,
    CompanyRepository,
    PrismaService,
    ValidationModule,
  ],
})
export class CompanyModule {}
