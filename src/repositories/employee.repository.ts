import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class EmployeeRepository extends BaseRepository<any> {
  constructor(prisma: PrismaService) {
    const relations = {};
    super(prisma, 'employee', relations, true); // 'role' is the Prisma model name
  }

  async create(data: any, user_id?: string) {
    try {
      const check = await this.checkUnique(data.email);
      if (!check) {
        throw new RpcException('Email already exists');
      }
      return super.create(data, user_id);
    } catch (error) {
      throw new RpcException(`Create failed: ${error.message}`);
    }
  }

  async update(id: string, data: any, user_id?: string) {
    try {
      return super.update(id, data, user_id);
    } catch (error) {
      throw new RpcException(`Update failed: ${error.message}`);
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
