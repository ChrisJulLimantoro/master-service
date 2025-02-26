import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';

@Injectable()
export class EmployeeRepository extends BaseRepository<any> {
  constructor(prisma: PrismaService) {
    const relations = {};
    super(prisma, 'employee', relations, true); // 'role' is the Prisma model name
  }

  async create(data: any) {
    try {
      const check = await this.checkUnique(data.email);
      if (!check) {
        throw new Error('Email already exists');
      }
      return await this.prisma.employee.create({ data });
    } catch (error) {
      throw new Error(`Create failed: ${error.message}`);
    }
  }

  async update(id: string, data: any) {
    try {
      return await this.prisma.employee.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new Error(`Update failed: ${error.message}`);
    }
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
