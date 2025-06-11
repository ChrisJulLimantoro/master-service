import { Module } from '@nestjs/common';
import { OwnerController } from './owner.controller';
import { OwnerService } from './owner.service';
import { OwnerRepository } from 'src/repositories/owner.repository';

@Module({
  imports: [],
  controllers: [OwnerController],
  providers: [OwnerService, OwnerRepository],
})
export class OwnerModule {}
