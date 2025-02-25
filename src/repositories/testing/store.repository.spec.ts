import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { StoreRepository } from '../store.repository';
import { randomUUID } from 'crypto';

describe('Store Repository Unit Testing', () => {
  let repository: StoreRepository;
  let prisma: PrismaService;
  let company_id_1: string;
  let company_id_2: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, StoreRepository],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
    repository = module.get<StoreRepository>(StoreRepository);

    await prisma.$connect(); // Ensure database connection
  });

  beforeEach(async () => {
    if (process.env.DATABASE_URL?.includes('test')) {
      const owner_id_1 = (
        await prisma.owner.create({
          data: {
            email: 'owner_email',
            name: 'owner',
            password: 'password',
          },
        })
      ).id;

      const company_1 = await prisma.company.create({
        data: {
          name: 'Company A',
          code: 'CMPA',
          owner_id: owner_id_1,
        },
      });

      company_id_1 = company_1.id; // Store for use in each test
      const company_2 = await prisma.company.create({
        data: {
          name: 'Company B',
          code: 'CMPB',
          owner_id: owner_id_1,
        },
      });

      company_id_2 = company_2.id; // Store for use in each test
    } else {
      console.warn('⚠️ Aborting test: DATABASE_URL does not include "test"');
      return;
    }
  });

  afterEach(async () => {
    await prisma.store.deleteMany(); // Clear previous
    await prisma.company.deleteMany(); // Clear previous
    await prisma.owner.deleteMany(); // Clear previous
  });

  afterAll(async () => {
    await prisma.$disconnect(); // Close DB connection
  });

  describe('create', () => {
    it('should create a new store', async () => {
      const newStore = await repository.create({
        name: 'NewStore',
        code: 'NWS',
        npwp: '123456789',
        open_date: new Date(),
        address: 'Jl. Store',
        longitude: 123.123,
        latitude: 123.123,
        company_id: company_id_1,
        logo: 'hello',
        is_active: false,
        is_flex_price: false,
        is_float_price: false,
        tax_percentage: 10,
        poin_config: 5,
      });
      const dbStore = await prisma.store.findUnique({
        where: { id: newStore.id },
      });

      expect(dbStore).toBeDefined();
      expect(dbStore?.name).toBe('NewStore');
    });

    it('should throw an error if required fields are missing', async () => {
      await expect(repository.create({ name: 'newStore' })).rejects.toThrow();
    });
  });

  describe('bulkCreate', () => {
    it('should insert multiple stores', async () => {
      const count = await repository.bulkCreate([
        {
          name: 'NewStore',
          code: 'NWS',
          npwp: '123456789',
          open_date: new Date(),
          address: 'Jl. Store',
          longitude: 123.123,
          latitude: 123.123,
          company_id: company_id_1,
          logo: 'hello',
          is_active: false,
          is_flex_price: false,
          is_float_price: false,
          tax_percentage: 10,
          poin_config: 5,
        },
        {
          name: 'NewStore',
          code: 'NWSA',
          npwp: '123456789',
          open_date: new Date(),
          address: 'Jl. Store',
          longitude: 123.123,
          latitude: 123.123,
          company_id: company_id_1,
          logo: 'hello',
          is_active: false,
          is_flex_price: false,
          is_float_price: false,
          tax_percentage: 10,
          poin_config: 5,
        },
      ]);

      expect(count).toBe(2);
    });

    it('should handle duplicate records gracefully', async () => {
      await repository.bulkCreate([
        {
          name: 'NewStore A',
          code: 'NWS',
          npwp: '123456789123',
          open_date: new Date(),
          address: 'Jl. Store 12312',
          longitude: 123.123213,
          latitude: 123.123123,
          company_id: company_id_1,
          logo: 'hello 123123',
          is_active: false,
          is_flex_price: true,
          is_float_price: true,
          tax_percentage: 10,
          poin_config: 5,
        },
      ]);
      const count = await repository.bulkCreate([
        {
          name: 'NewStore',
          code: 'NWS',
          npwp: '123456789',
          open_date: new Date(),
          address: 'Jl. Store',
          longitude: 123.123,
          latitude: 123.123,
          company_id: company_id_1,
          logo: 'hello',
          is_active: false,
          is_flex_price: false,
          is_float_price: false,
          tax_percentage: 10,
          poin_config: 5,
        },
      ]);
      expect(count).toBe(0);
    });
  });

  describe('findAll', () => {
    it('should return all stores', async () => {
      await repository.bulkCreate([
        {
          name: 'NewStore',
          code: 'NWS',
          npwp: '123456789',
          open_date: new Date(),
          address: 'Jl. Store',
          longitude: 123.123,
          latitude: 123.123,
          company_id: company_id_1,
          logo: 'hello',
          is_active: false,
          is_flex_price: false,
          is_float_price: false,
          tax_percentage: 10,
          poin_config: 5,
        },
        {
          name: 'NewStore',
          code: 'NWSA',
          npwp: '123456789',
          open_date: new Date(),
          address: 'Jl. Store',
          longitude: 123.123,
          latitude: 123.123,
          company_id: company_id_2,
          logo: 'hello',
          is_active: false,
          is_flex_price: false,
          is_float_price: false,
          tax_percentage: 10,
          poin_config: 5,
        },
      ]);

      const result = await repository.findAll();
      expect(result).toHaveLength(2);
    });
    it('should return all stores with filter (company_id)', async () => {
      await repository.bulkCreate([
        {
          name: 'NewStore',
          code: 'NWS',
          npwp: '123456789',
          open_date: new Date(),
          address: 'Jl. Store',
          longitude: 123.123,
          latitude: 123.123,
          company_id: company_id_1,
          logo: 'hello',
          is_active: false,
          is_flex_price: false,
          is_float_price: false,
          tax_percentage: 10,
          poin_config: 5,
        },
        {
          name: 'NewStore',
          code: 'NWSA',
          npwp: '123456789',
          open_date: new Date(),
          address: 'Jl. Store',
          longitude: 123.123,
          latitude: 123.123,
          company_id: company_id_2,
          logo: 'hello',
          is_active: false,
          is_flex_price: false,
          is_float_price: false,
          tax_percentage: 10,
          poin_config: 5,
        },
      ]);

      const result = await repository.findAll({ company_id: company_id_1 });
      expect(result).toHaveLength(1);
    });
    it('should return all stores withouth the deleted', async () => {
      const id = (
        await repository.create({
          name: 'NewStore',
          code: 'NWS',
          npwp: '123456789',
          open_date: new Date(),
          address: 'Jl. Store',
          longitude: 123.123,
          latitude: 123.123,
          company_id: company_id_1,
          logo: 'hello',
          is_active: false,
          is_flex_price: false,
          is_float_price: false,
          tax_percentage: 10,
          poin_config: 5,
        })
      ).id;

      await repository.delete(id);

      const result = await repository.findAll();
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return a store by ID', async () => {
      const store = await repository.create({
        name: 'NewStore',
        code: 'NWS',
        npwp: '123456789',
        open_date: new Date(),
        address: 'Jl. Store',
        longitude: 123.123,
        latitude: 123.123,
        company_id: company_id_1,
        logo: 'hello',
        is_active: false,
        is_flex_price: false,
        is_float_price: false,
        tax_percentage: 10,
        poin_config: 5,
      });

      const result = await repository.findOne(store.id);
      expect(result).toBeDefined();
      expect(result?.name).toBe('NewStore');
    });

    it('should return null if store does not exist', async () => {
      const result = await repository.findOne(randomUUID());
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update an existing store', async () => {
      const store = await repository.create({
        name: 'NewStore',
        code: 'NWS',
        npwp: '123456789',
        open_date: new Date(),
        address: 'Jl. Store',
        longitude: 123.123,
        latitude: 123.123,
        company_id: company_id_1,
        logo: 'hello',
        is_active: false,
        is_flex_price: false,
        is_float_price: false,
        tax_percentage: 10,
        poin_config: 5,
      });

      await repository.update(store.id, { name: 'Updated Name' });
      const updatedStore = await repository.findOne(store.id);

      expect(updatedStore?.name).toBe('Updated Name');
    });
  });

  describe('delete', () => {
    it('should delete a store', async () => {
      const store = await repository.create({
        name: 'NewStore',
        code: 'NWS',
        npwp: '123456789',
        open_date: new Date(),
        address: 'Jl. Store',
        longitude: 123.123,
        latitude: 123.123,
        company_id: company_id_1,
        logo: 'hello',
        is_active: false,
        is_flex_price: false,
        is_float_price: false,
        tax_percentage: 10,
        poin_config: 5,
      });

      await repository.delete(store.id);
      const deletedStore = await repository.findOne(store.id);

      expect(deletedStore).toBeNull();
    });
  });

  describe('restore', () => {
    it('should restore a soft deleted store', async () => {
      const store = await repository.create({
        name: 'NewStore',
        code: 'NWS',
        npwp: '123456789',
        open_date: new Date(),
        address: 'Jl. Store',
        longitude: 123.123,
        latitude: 123.123,
        company_id: company_id_1,
        logo: 'hello',
        is_active: false,
        is_flex_price: false,
        is_float_price: false,
        tax_percentage: 10,
        poin_config: 5,
      });

      await repository.delete(store.id);
      const deletedStore = await repository.findOne(store.id);

      expect(deletedStore).toBeNull();
      await repository.restore(store.id);
      const restoredStore = await repository.findOne(store.id);
      expect(restoredStore).toBeDefined();
    });
  });

  describe('count', () => {
    it('should return the total number of stores without Filter', async () => {
      await repository.bulkCreate([
        {
          name: 'NewStore',
          code: 'NWS',
          npwp: '123456789',
          open_date: new Date(),
          address: 'Jl. Store',
          longitude: 123.123,
          latitude: 123.123,
          company_id: company_id_1,
          logo: 'hello',
          is_active: false,
          is_flex_price: false,
          is_float_price: false,
          tax_percentage: 10,
          poin_config: 5,
        },
        {
          name: 'NewStore',
          code: 'NWSA',
          npwp: '123456789',
          open_date: new Date(),
          address: 'Jl. Store',
          longitude: 123.123,
          latitude: 123.123,
          company_id: company_id_1,
          logo: 'hello',
          is_active: false,
          is_flex_price: false,
          is_float_price: false,
          tax_percentage: 10,
          poin_config: 5,
        },
      ]);
      const result = await repository.count();
      expect(result).toBe(2);
    });
    it('should return the total number of stores with Filter Company', async () => {
      await repository.bulkCreate([
        {
          name: 'NewStore',
          code: 'NWS',
          npwp: '123456789',
          open_date: new Date(),
          address: 'Jl. Store',
          longitude: 123.123,
          latitude: 123.123,
          company_id: company_id_1,
          logo: 'hello',
          is_active: false,
          is_flex_price: false,
          is_float_price: false,
          tax_percentage: 10,
          poin_config: 5,
        },
        {
          name: 'NewStore',
          code: 'NWS',
          npwp: '123456789',
          open_date: new Date(),
          address: 'Jl. Store',
          longitude: 123.123,
          latitude: 123.123,
          company_id: company_id_2,
          logo: 'hello',
          is_active: false,
          is_flex_price: false,
          is_float_price: false,
          tax_percentage: 10,
          poin_config: 5,
        },
      ]);
      const result = await repository.count({ company_id: company_id_1 });
      expect(result).toBe(1);
    });
  });
});
