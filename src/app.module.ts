import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessagePatternDiscoveryService } from './discovery/message-pattern-discovery.service';
import { DiscoveryModule } from '@nestjs/core';
import { ValidationModule } from './validation/validation.module';
import { PrismaModule } from './prisma/prisma.module';
import { CompanyModule } from './company/company.module';
import { StoreModule } from './store/store.module';
import { OwnerModule } from './owner/owner.module';
import { EmployeeModule } from './employee/employee.module';

@Module({
  imports: [
    DiscoveryModule,
    ValidationModule.forRoot(),
    PrismaModule,
    CompanyModule,
    StoreModule,
    OwnerModule,
    EmployeeModule,
  ],
  controllers: [AppController],
  providers: [AppService, MessagePatternDiscoveryService],
})
export class AppModule {}
