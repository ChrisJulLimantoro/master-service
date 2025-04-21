import { Module } from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { CompanyRepository } from 'src/repositories/company.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { ValidationModule } from 'src/validation/validation.module';

@Module({
  imports: [],
  controllers: [CompanyController],
  providers: [
    CompanyService,
    CompanyRepository,
    PrismaService,
    ValidationModule,
  ],
})
export class CompanyModule {}
