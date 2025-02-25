import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { skip } from 'node:test';

@Injectable()
export class BaseRepository<T> {
  constructor(
    protected prisma: PrismaService,
    private modelName: string,
    protected relations: Record<string, any>,
    protected isSoftDelete = false,
  ) {}

  // Create a new record with possible relations
  async create(data: any): Promise<T> {
    try {
      return this.prisma[this.modelName].create({
        data,
      });
    } catch (error) {
      throw new Error(`Create failed: ${error.message}`);
    }
  }

  async bulkCreate(data: any[]): Promise<number> {
    try {
      const result = await this.prisma[this.modelName].createMany({
        data,
        skipDuplicates: true, // Prevents errors on duplicate records
      });

      return result.count; // Only returns count, not inserted data
    } catch (error) {
      throw new Error(`Bulk insert failed: ${error.message}`);
    }
  }

  // Get all records with possible relations and filter criteria
  async findAll(filter?: Record<string, any>): Promise<T[]> {
    const whereConditions: Record<string, any> = {
      ...(this.isSoftDelete ? { deleted_at: null } : {}),
      ...filter, // Add the provided filter conditions
    };

    try {
      return this.prisma[this.modelName].findMany({
        where: whereConditions, // Apply dynamic filter along with soft delete condition
        include: this.relations,
      });
    } catch (error) {
      throw new Error(`Find all failed: ${error.message}`);
    }
  }

  // Find a record by ID with possible relations and filter criteria
  async findOne(id: string, filter?: Record<string, any>): Promise<T | null> {
    const whereConditions: Record<string, any> = {
      ...(this.isSoftDelete ? { id, deleted_at: null } : { id }),
      ...filter, // Add the provided filter conditions
    };

    try {
      return this.prisma[this.modelName].findUnique({
        where: whereConditions, // Apply dynamic filter along with soft delete condition
        include: this.relations,
      });
    } catch (error) {
      throw new Error(`Find one failed: ${error.message}`);
    }
  }

  // Update a record with possible relations
  async update(id: string, data: any): Promise<T> {
    data.updated_at = new Date();
    try {
      return this.prisma[this.modelName].update({
        where: this.isSoftDelete ? { id, deleted_at: null } : { id },
        data,
      });
    } catch (error) {
      throw new Error(`Update failed: ${error.message}`);
    }
  }

  // Delete a record by ID
  async delete(id: string): Promise<T> {
    try {
      if (this.isSoftDelete) {
        return this.prisma[this.modelName].update({
          where: { id },
          data: { deleted_at: new Date(), updated_at: new Date() },
        });
      }
      return this.prisma[this.modelName].delete({
        where: { id },
      });
    } catch (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  // Restore a soft deleted record
  async restore(id: string): Promise<T> {
    try {
      return this.prisma[this.modelName].update({
        where: { id },
        data: { deleted_at: null, updated_at: new Date() },
      });
    } catch (error) {
      throw new Error(`Restore failed: ${error.message}`);
    }
  }

  // function for count
  async count(filter?: Record<string, any>): Promise<number> {
    try {
      return this.prisma[this.modelName].count({
        where: filter,
      });
    } catch (error) {
      throw new Error(`Count failed: ${error.message}`);
    }
  }
}
