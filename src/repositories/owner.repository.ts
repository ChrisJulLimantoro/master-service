import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/repositories/base.repository';
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

  async create(data: any) {
    const check = await this.checkUnique(data.email);
    if (check) {
      return await this.prisma.owner.create({ data });
    }
    return null;
  }

  async update(id: string, data: any) {
    return await this.prisma.owner.update({
      where: { id },
      data,
    });
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
