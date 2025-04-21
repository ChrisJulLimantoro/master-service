import { Module } from '@nestjs/common';
import { StoreController } from './store.controller';
import { StoreService } from './store.service';
import { StoreRepository } from 'src/repositories/store.repository';
import { ValidationModule } from 'src/validation/validation.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [StoreController],
  providers: [StoreService, StoreRepository, ValidationModule, PrismaService],
})
export class StoreModule {}
