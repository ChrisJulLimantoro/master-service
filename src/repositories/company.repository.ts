import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';

@Injectable()
export class CompanyRepository extends BaseRepository<any> {
  constructor(prisma: PrismaService) {
    const relations = {
      stores: {
        where: {
          deleted_at: null,
        },
      },
      owner: true,
    };
    super(prisma, 'company', relations, true); // 'role' is the Prisma model name
  }
}
