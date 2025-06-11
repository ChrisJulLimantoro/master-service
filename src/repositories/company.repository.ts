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

  async findAllEmails(company_id: string): Promise<string[]> {
    const companies = await this.prisma.company.findMany({
      where: {
        id: company_id,
      },
      select: {
        owner: {
          select: {
            email: true,
            employees: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });
  
    if (!companies || companies.length === 0) return [];
  
    const ownerData = companies[0].owner;
  
    const emails = [
      ownerData.email,
      ...ownerData.employees.map((employee) => employee.email),
    ];
  
    return emails;
  }
}
