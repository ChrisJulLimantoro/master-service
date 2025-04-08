import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

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
    return this.prisma[this.modelName].create({
      data,
      include: this.relations,
    });
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
  async findAll(
    filter?: Record<string, any>,
    page?: number,
    limit?: number,
    sort?: Record<string, 'asc' | 'desc'>,
    search?: string,
  ): Promise<{
    data: any[];
    total?: number;
    page?: number;
    totalPages?: number;
  }> {
    const fields = (await this.getModelFields()).filter(
      (field) => !field.name.includes('id'),
    );
    const stringFields = fields.filter(
      (field) => field.type.toLowerCase() === 'string',
    );

    const searchConditions = search
      ? {
          OR: stringFields.map((field) => ({
            [field.name]: {
              contains: search,
              mode: 'insensitive',
            },
          })),
        }
      : {};

    // Prepare dynamic date filter (assumes the column is named 'date')
    let dateFilter = {};
    if (filter?.date?.start || filter?.date?.end) {
      const dateField = filter.date.field || 'date';
      const startDate = filter.date.start
        ? new Date(filter.date.start)
        : new Date(0);
      const endDate = filter.date.end ? new Date(filter.date.end) : new Date();

      dateFilter = {
        [dateField]: {
          gte: startDate,
          lte: endDate,
        },
      };
      // Remove the `date` key from filter so it doesn't get included again below
    }
    delete filter.date;

    // Ensure correct WHERE structure: deleted_at IS NULL AND (OR conditions)
    const whereConditions = {
      AND: {
        ...(this.isSoftDelete
          ? { deleted_at: null }
          : { NOT: { deleted_at: null } }),
        ...searchConditions,
        ...filter,
        ...dateFilter,
      },
    };

    // Apply sorting
    const orderBy = sort
      ? Object.entries(sort).map(([key, value]) => ({
          [key]: value,
        }))
      : undefined;

    // If page & limit are not provided, return all records (no pagination)
    if (!page || !limit || page === 0 || limit === 0) {
      const data = await this.prisma[this.modelName].findMany({
        where: whereConditions,
        include: this.relations,
      });
      return { data }; // No pagination metadata
    }

    // Get total count before applying pagination
    const total = await this.prisma[this.modelName].count({
      where: whereConditions,
    });

    // Fetch paginated records
    const data = await this.prisma[this.modelName].findMany({
      where: whereConditions,
      include: this.relations,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: orderBy,
    });

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Find a record by ID with possible relations and filter criteria
  async findOne(id: string, filter?: Record<string, any>): Promise<T | null> {
    const whereConditions: Record<string, any> = {
      ...(this.isSoftDelete ? { id, deleted_at: null } : { id }),
      ...filter, // Add the provided filter conditions
    };

    return this.prisma[this.modelName].findUnique({
      where: whereConditions, // Apply dynamic filter along with soft delete condition
      include: this.relations,
    });
  }

  // Update a record with possible relations
  async update(id: string, data: any): Promise<T> {
    data.updated_at = new Date();
    return this.prisma[this.modelName].update({
      where: this.isSoftDelete ? { id, deleted_at: null } : { id },
      data,
      include: this.relations,
    });
  }

  // Delete a record by ID
  async delete(id: string): Promise<T> {
    if (this.isSoftDelete) {
      return this.prisma[this.modelName].update({
        where: { id },
        data: { deleted_at: new Date(), updated_at: new Date() },
      });
    }
    return this.prisma[this.modelName].delete({
      where: { id },
    });
  }

  async deleteWhere(filter: Record<string, any>): Promise<number> {
    if (filter.length === 0) {
      throw new Error('Filter cannot be empty');
    }
    if (this.isSoftDelete) {
      filter.deleted_at = null;
      return this.prisma[this.modelName].updateMany({
        where: filter,
        data: { deleted_at: new Date(), updated_at: new Date() },
      });
    }

    return this.prisma[this.modelName].deleteMany({
      where: filter,
    });
  }

  // Restore a soft deleted record
  async restore(id: string): Promise<T> {
    return this.prisma[this.modelName].update({
      where: { id },
      data: { deleted_at: null, updated_at: new Date() },
    });
  }

  // function for count
  async count(filter?: Record<string, any>): Promise<number> {
    return this.prisma[this.modelName].count({
      where: filter,
    });
  }

  async getModelFields(): Promise<Record<string, string>[]> {
    const model = Prisma.dmmf.datamodel.models.find(
      (m) => m.name.toLowerCase() === this.modelName.toLowerCase(),
    );
    if (!model) throw new Error(`Model ${this.modelName} not found`);

    return model.fields.map((field) => ({
      name: field.name,
      type: field.type,
    }));
  }

  async sync(data: any[]) {
    const datas = await Promise.all(
      data.map((d) =>
        this.prisma[this.modelName].upsert({
          where: { id: d.id },
          update: d,
          create: d,
        }),
      ),
    );
    return datas;
  }
}
