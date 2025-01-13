import { Module } from '@nestjs/common';
import { OwnerController } from './owner.controller';
import { OwnerService } from './owner.service';
import { OwnerRepository } from 'src/repositories/owner.repository';
import { SharedModule } from 'src/shared.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [SharedModule],
  controllers: [OwnerController],
  providers: [OwnerService, OwnerRepository, PrismaService],
})
export class OwnerModule {}
