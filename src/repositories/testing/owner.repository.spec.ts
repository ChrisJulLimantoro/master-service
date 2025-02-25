import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { OwnerRepository } from '../owner.repository';
import { randomUUID } from 'crypto';

describe('Owner Repository Unit Testing', () => {
  let repository: OwnerRepository;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, OwnerRepository],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
    repository = module.get<OwnerRepository>(OwnerRepository);

    await prisma.$connect(); // Ensure database connection
  });

  beforeEach(async () => {
    await prisma.owner.deleteMany(); // Clear previous owners
  });

  afterEach(async () => {
    await prisma.owner.deleteMany(); // Clear previous owners
  });

  afterAll(async () => {
    await prisma.$disconnect(); // Close DB connection
  });

  describe('create', () => {
    it('should create a new owner', async () => {
      const newOwner = await repository.create({
        email: 'Owner-email',
        name: 'Owner 1',
        password: 'password',
      });
      const dbOwner = await prisma.owner.findUnique({
        where: { id: newOwner.id },
      });

      expect(dbOwner).toBeDefined();
      expect(dbOwner?.name).toBe('Owner 1');
    });

    it('should throw an error if required fields are missing', async () => {
      await expect(repository.create({ email: 'hello' })).rejects.toThrow();
    });
  });

  describe('bulkCreate', () => {
    it('should insert multiple owners', async () => {
      const count = await repository.bulkCreate([
        {
          email: 'Owner-email-1',
          name: 'Owner 1',
          password: 'password',
        },
        {
          email: 'Owner-email-2',
          name: 'Owner 2',
          password: 'password',
        },
      ]);

      expect(count).toBe(2);
    });

    it('should handle duplicate records gracefully', async () => {
      await repository.bulkCreate([
        {
          email: 'Owner-email-1',
          name: 'Owner 1',
          password: 'password',
        },
      ]);
      const count = await repository.bulkCreate([
        {
          email: 'Owner-email-1',
          name: 'Owner 2',
          password: 'passwords',
        },
      ]);
      expect(count).toBe(0);
    });
  });

  describe('findAll', () => {
    it('should return all owners', async () => {
      await repository.bulkCreate([
        {
          email: 'Owner-email-1',
          name: 'Owner 1',
          password: 'password',
        },
        {
          email: 'Owner-email-2',
          name: 'Owner 2',
          password: 'password',
        },
      ]);

      const result = await repository.findAll();
      expect(result).toHaveLength(2);
    });
    it('should return all owners without the deleted', async () => {
      const id = (
        await repository.create({
          email: 'Owner-email-1',
          name: 'Owner 1',
          password: 'password',
        })
      ).id;

      await repository.delete(id);

      const result = await repository.findAll();
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return a owner by ID', async () => {
      const owner = await repository.create({
        email: 'Owner-email-1',
        name: 'Owner 1',
        password: 'password',
      });

      const result = await repository.findOne(owner.id);
      expect(result).toBeDefined();
      expect(result?.name).toBe('Owner 1');
    });

    it('should return null if owner does not exist', async () => {
      const result = await repository.findOne(randomUUID());
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update an existing owner', async () => {
      const owner = await repository.create({
        email: 'Owner-email-1',
        name: 'Owner 1',
        password: 'password',
      });

      await repository.update(owner.id, { name: 'Updated Name' });
      const updatedOwner = await repository.findOne(owner.id);

      expect(updatedOwner?.name).toBe('Updated Name');
    });
  });

  describe('delete', () => {
    it('should delete a owner', async () => {
      const owner = await repository.create({
        email: 'Owner-email-1',
        name: 'Owner 1',
        password: 'password',
      });

      await repository.delete(owner.id);
      const deletedOwner = await repository.findOne(owner.id);

      expect(deletedOwner).toBeNull();
    });
  });

  describe('restore', () => {
    it('should restore a soft deleted owner', async () => {
      const owner = await repository.create({
        email: 'Owner-email-1',
        name: 'Owner 1',
        password: 'password',
      });

      await repository.delete(owner.id);
      const deletedOwner = await repository.findOne(owner.id);

      expect(deletedOwner).toBeNull();
      await repository.restore(owner.id);
      const restoredOwner = await repository.findOne(owner.id);
      expect(restoredOwner).toBeDefined();
    });
  });

  describe('count', () => {
    it('should return the total number of owners without Filter', async () => {
      await repository.bulkCreate([
        {
          email: 'Owner-email-1',
          name: 'Owner 1',
          password: 'password',
        },
        {
          email: 'Owner-email-2',
          name: 'Owner 2',
          password: 'password',
        },
      ]);
      const result = await repository.count();
      expect(result).toBe(2);
    });
  });
});
