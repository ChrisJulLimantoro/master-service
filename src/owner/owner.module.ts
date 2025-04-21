import { Module } from '@nestjs/common';
import { OwnerController } from './owner.controller';
import { OwnerService } from './owner.service';
import { OwnerRepository } from 'src/repositories/owner.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [],
  controllers: [OwnerController],
  providers: [OwnerService, OwnerRepository, PrismaService],
})
export class OwnerModule {}
