import { Module } from '@nestjs/common';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';
import { EmployeeRepository } from 'src/repositories/employee.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { OwnerRepository } from 'src/repositories/owner.repository';

@Module({
  imports: [],
  controllers: [EmployeeController],
  providers: [
    EmployeeService,
    EmployeeRepository,
    PrismaService,
    OwnerRepository,
  ],
})
export class EmployeeModule {}
