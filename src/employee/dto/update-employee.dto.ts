import { z } from 'zod';
export class UpdateEmployeeRequest {
  name: string | null;
  password: string | null;

  constructor(data: { name: string | null; password: string | null }) {
    this.name = data.name;
    this.password = data.password;
  }

  static schema() {
    return z.object({
      name: z.string().min(5).max(255).optional(),
      password: z.string().min(8).max(255).optional(),
    });
  }
}
