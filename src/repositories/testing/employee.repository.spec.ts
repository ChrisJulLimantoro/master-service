import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { EmployeeRepository } from '../employee.repository';
import { randomUUID } from 'crypto';

describe('Employee Repository Unit Testing', () => {
  let repository: EmployeeRepository;
  let prisma: PrismaService;
  let owner_id_1: string;
  let owner_id_2: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, EmployeeRepository],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
    repository = module.get<EmployeeRepository>(EmployeeRepository);

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
    await prisma.employee.deleteMany(); // Clear previous
    await prisma.owner.deleteMany(); // Clear previous
  });

  afterAll(async () => {
    await prisma.$disconnect(); // Close DB connection
  });

  describe('create', () => {
    it('should create a new employee', async () => {
      const newEmployee = await repository.create({
        name: 'employee_1',
        email: 'employee_1-email',
        password: 'password',
        owner_id: owner_id_1,
      });
      const dbEmployee = await prisma.employee.findUnique({
        where: { id: newEmployee.id },
      });

      expect(dbEmployee).toBeDefined();
      expect(dbEmployee?.name).toBe('employee_1');
    });

    it('should throw an error if required fields are missing', async () => {
      await expect(repository.create({})).rejects.toThrow();
    });
  });

  describe('bulkCreate', () => {
    it('should insert multiple employees', async () => {
      const count = await repository.bulkCreate([
        {
          name: 'employee_1',
          email: 'employee_1-email',
          password: 'password',
          owner_id: owner_id_1,
        },
        {
          name: 'employee_2',
          email: 'employee_2-email',
          password: 'password',
          owner_id: owner_id_2,
        },
      ]);

      expect(count).toBe(2);
    });

    it('should handle duplicate records gracefully', async () => {
      await repository.bulkCreate([
        {
          name: 'employee_1',
          email: 'employee_1-email',
          password: 'password',
          owner_id: owner_id_1,
        },
      ]);
      const count = await repository.bulkCreate([
        {
          name: 'employee_1',
          email: 'employee_1-email',
          password: 'password',
          owner_id: owner_id_1,
        },
      ]);
      expect(count).toBe(0);
    });
  });

  describe('findAll', () => {
    it('should return all employees', async () => {
      await repository.bulkCreate([
        {
          name: 'employee_1',
          email: 'employee_1-email',
          password: 'password',
          owner_id: owner_id_1,
        },
        {
          name: 'employee_2',
          email: 'employee_2-email',
          password: 'password',
          owner_id: owner_id_2,
        },
      ]);

      const result = await repository.findAll();
      expect(result).toHaveLength(2);
    });
    it('should return all employees with filter (owner_id)', async () => {
      await repository.bulkCreate([
        {
          name: 'employee_1',
          email: 'employee_1-email',
          password: 'password',
          owner_id: owner_id_1,
        },
        {
          name: 'employee_2',
          email: 'employee_2-email',
          password: 'password',
          owner_id: owner_id_2,
        },
      ]);

      const result = await repository.findAll({ owner_id: owner_id_1 });
      expect(result).toHaveLength(1);
    });
    it('should return all employees withouth the deleted', async () => {
      const id = (
        await repository.create({
          name: 'employee_1',
          email: 'employee_1-email',
          password: 'password',
          owner_id: owner_id_1,
        })
      ).id;

      await repository.delete(id);

      const result = await repository.findAll();
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return a employee by ID', async () => {
      const employee = await repository.create({
        name: 'employee_1',
        email: 'employee_1-email',
        password: 'password',
        owner_id: owner_id_1,
      });

      const result = await repository.findOne(employee.id);
      expect(result).toBeDefined();
      expect(result?.name).toBe('employee_1');
    });

    it('should return null if employee does not exist', async () => {
      const result = await repository.findOne(randomUUID());
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update an existing employee', async () => {
      const employee = await repository.create({
        name: 'employee_1',
        email: 'employee_1-email',
        password: 'password',
        owner_id: owner_id_1,
      });

      await repository.update(employee.id, { name: 'Updated Name' });
      const updatedEmployee = await repository.findOne(employee.id);

      expect(updatedEmployee?.name).toBe('Updated Name');
    });
  });

  describe('delete', () => {
    it('should delete a employee', async () => {
      const employee = await repository.create({
        name: 'employee_1',
        email: 'employee_1-email',
        password: 'password',
        owner_id: owner_id_1,
      });

      await repository.delete(employee.id);
      const deletedEmployee = await repository.findOne(employee.id);

      expect(deletedEmployee).toBeNull();
    });
  });

  describe('restore', () => {
    it('should restore a soft deleted employee', async () => {
      const employee = await repository.create({
        name: 'employee_1',
        email: 'employee_1-email',
        password: 'password',
        owner_id: owner_id_1,
      });

      await repository.delete(employee.id);
      const deletedEmployee = await repository.findOne(employee.id);

      expect(deletedEmployee).toBeNull();
      await repository.restore(employee.id);
      const restoredEmployee = await repository.findOne(employee.id);
      expect(restoredEmployee).toBeDefined();
    });
  });

  describe('count', () => {
    it('should return the total number of employees without Filter', async () => {
      await repository.bulkCreate([
        {
          name: 'employee_1',
          email: 'employee_1-email',
          password: 'password',
          owner_id: owner_id_1,
        },
        {
          name: 'employee_2',
          email: 'employee_2-email',
          password: 'password',
          owner_id: owner_id_2,
        },
      ]);
      const result = await repository.count();
      expect(result).toBe(2);
    });
    it('should return the total number of employees with Filter Owner', async () => {
      await repository.bulkCreate([
        {
          name: 'employee_1',
          email: 'employee_1-email',
          password: 'password',
          owner_id: owner_id_1,
        },
        {
          name: 'employee_2',
          email: 'employee_2-email',
          password: 'password',
          owner_id: owner_id_2,
        },
      ]);
      const result = await repository.count({ owner_id: owner_id_1 });
      expect(result).toBe(1);
    });
  });
});
