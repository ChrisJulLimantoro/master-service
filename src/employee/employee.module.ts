import { Module } from '@nestjs/common';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { EmployeeRepository } from 'src/repositories/employee.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { SharedModule } from 'src/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [EmployeeController],
  providers: [EmployeeService, EmployeeRepository, PrismaService],
})
export class EmployeeModule {}
