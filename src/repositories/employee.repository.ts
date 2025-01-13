import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/repositories/base.repository';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeeRepository extends BaseRepository<any> {
  constructor(prisma: PrismaService) {
    const relations = {};
    super(prisma, 'employee', relations, true); // 'role' is the Prisma model name
  }

  async create(data: any) {
    data.password = await bcrypt.hash('password', 10);
    const check = await this.checkUnique(data.email);
    if (check) {
      return await this.prisma.employee.create({ data });
    }
    return null;
  }

  async update(id: string, data: any) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return await this.prisma.employee.update({
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
