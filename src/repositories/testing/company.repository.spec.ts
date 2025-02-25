import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { CompanyRepository } from '../company.repository';
import { randomUUID } from 'crypto';

describe('Company Repository Unit Testing', () => {
  let repository: CompanyRepository;
  let prisma: PrismaService;
  let owner_id_1: string;
  let owner_id_2: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, CompanyRepository],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
    repository = module.get<CompanyRepository>(CompanyRepository);

    await prisma.$connect(); // Ensure database connection
  });

  beforeEach(async () => {
    if (process.env.DATABASE_URL?.includes('test')) {
      const owner_1 = await prisma.owner.create({
        data: {
          email: 'owner_1@gmail.com',
          name: 'Owner',
          password: 'password',
        },
      });

      owner_id_1 = owner_1.id; // Store for use in each test
      const owner_2 = await prisma.owner.create({
        data: {
          email: 'owner_2@gmail.com',
          name: 'Owner',
          password: 'password',
        },
      });

      owner_id_2 = owner_2.id; // Store for use in each test
    } else {
      console.warn('⚠️ Aborting test: DATABASE_URL does not include "test"');
      return;
    }
  });

  afterEach(async () => {
    await prisma.company.deleteMany(); // Clear previous
    await prisma.owner.deleteMany(); // Clear previous
  });

  afterAll(async () => {
    await prisma.$disconnect(); // Close DB connection
  });

  describe('create', () => {
    it('should create a new company', async () => {
      const newCompany = await repository.create({
        name: 'NewCo',
        code: 'NCO',
        owner_id: owner_id_1,
      });
      const dbCompany = await prisma.company.findUnique({
        where: { id: newCompany.id },
      });

      expect(dbCompany).toBeDefined();
      expect(dbCompany?.name).toBe('NewCo');
    });

    it('should throw an error if required fields are missing', async () => {
      await expect(repository.create({})).rejects.toThrow();
    });
  });

  describe('bulkCreate', () => {
    it('should insert multiple companies', async () => {
      const count = await repository.bulkCreate([
        { name: 'Company A', code: 'CMPA', owner_id: owner_id_1 },
        { name: 'Company B', code: 'CMPB', owner_id: owner_id_2 },
      ]);

      expect(count).toBe(2);
    });

    it('should handle duplicate records gracefully', async () => {
      await repository.bulkCreate([
        { name: 'Company A', code: 'CMPA', owner_id: owner_id_1 },
      ]);
      const count = await repository.bulkCreate([
        { name: 'Company A', code: 'CMPA', owner_id: owner_id_1 },
      ]);
      expect(count).toBe(0);
    });
  });

  describe('findAll', () => {
    it('should return all companies', async () => {
      await repository.bulkCreate([
        { name: 'Company A', code: 'CMPA', owner_id: owner_id_1 },
        { name: 'Company B', code: 'CMPB', owner_id: owner_id_2 },
      ]);

      const result = await repository.findAll();
      expect(result).toHaveLength(2);
    });
    it('should return all companies with filter (owner_id)', async () => {
      await repository.bulkCreate([
        { name: 'Company A', code: 'CMPA', owner_id: owner_id_1 },
        { name: 'Company B', code: 'CMPB', owner_id: owner_id_2 },
      ]);

      const result = await repository.findAll({ owner_id: owner_id_1 });
      expect(result).toHaveLength(1);
    });
    it('should return all companies withouth the deleted', async () => {
      const id = (
        await repository.create({
          name: 'Company A',
          code: 'CMPA',
          owner_id: owner_id_1,
        })
      ).id;

      await repository.delete(id);

      const result = await repository.findAll();
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return a company by ID', async () => {
      const company = await repository.create({
        name: 'FindMe',
        code: 'FND',
        owner_id: owner_id_1,
      });

      const result = await repository.findOne(company.id);
      expect(result).toBeDefined();
      expect(result?.name).toBe('FindMe');
    });

    it('should return null if company does not exist', async () => {
      const result = await repository.findOne(randomUUID());
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update an existing company', async () => {
      const company = await repository.create({
        name: 'Old Name',
        code: 'CMP1',
        owner_id: owner_id_1,
      });

      await repository.update(company.id, { name: 'Updated Name' });
      const updatedCompany = await repository.findOne(company.id);

      expect(updatedCompany?.name).toBe('Updated Name');
    });
  });

  describe('delete', () => {
    it('should delete a company', async () => {
      const company = await repository.create({
        name: 'Company X',
        code: 'CMPX',
        owner_id: owner_id_1,
      });

      await repository.delete(company.id);
      const deletedCompany = await repository.findOne(company.id);

      expect(deletedCompany).toBeNull();
    });
  });

  describe('restore', () => {
    it('should restore a soft deleted company', async () => {
      const company = await repository.create({
        name: 'Company X',
        code: 'CMPX',
        owner_id: owner_id_1,
      });

      await repository.delete(company.id);
      const deletedCompany = await repository.findOne(company.id);

      expect(deletedCompany).toBeNull();
      await repository.restore(company.id);
      const restoredCompany = await repository.findOne(company.id);
      expect(restoredCompany).toBeDefined();
    });
  });

  describe('count', () => {
    it('should return the total number of companies without Filter', async () => {
      await repository.bulkCreate([
        { name: 'Company A', code: 'CMPA', owner_id: owner_id_1 },
        { name: 'Company B', code: 'CMPB', owner_id: owner_id_2 },
      ]);
      const result = await repository.count();
      expect(result).toBe(2);
    });
    it('should return the total number of companies with Filter Owner', async () => {
      await repository.bulkCreate([
        { name: 'Company A', code: 'CMPA', owner_id: owner_id_1 },
        { name: 'Company B', code: 'CMPB', owner_id: owner_id_2 },
      ]);
      const result = await repository.count({ owner_id: owner_id_1 });
      expect(result).toBe(1);
    });
  });
});
