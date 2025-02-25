import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';

@Injectable()
export class StoreRepository extends BaseRepository<any> {
  constructor(prisma: PrismaService) {
    const relations = {
      company: true,
    };
    super(prisma, 'store', relations, true); // 'role' is the Prisma model name
  }
}
