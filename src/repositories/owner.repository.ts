import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OwnerRepository extends BaseRepository<any> {
  constructor(prisma: PrismaService) {
    const relations = {
      companies: {
        where: {
          deleted_at: null,
        },
      },
    };
    super(prisma, 'owner', relations, true); // 'role' is the Prisma model name
  }

  async create(data: any, user_id?: string) {
    const check = await this.checkUnique(data.email);
    if (check) {
      return super.create(data, user_id);
    }
    return null;
  }

  async update(id: string, data: any, user_id?: string) {
    return super.update(id, data, user_id);
  }

  async checkUnique(email: string) {
    return (
      (await this.prisma.owner.count({
        where: {
          email: email,
        },
      })) +
        (await this.prisma.employee.count({
          where: {
            email: email,
          },
        })) ===
      0
    );
  }
}
