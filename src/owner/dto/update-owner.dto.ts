import { z } from 'zod';
export class UpdateOwnerRequest {
  name: string | null;
  password: string | null;

  constructor(data: { name: string | null; password: string | null }) {
    this.name = data.name;
    this.password = data.password;
  }

  static schema() {
    return z.object({
      name: z.string().min(5).max(255).nullable().optional(),
      password: z.string().min(8).max(50).nullable().optional(),
    });
  }
}
