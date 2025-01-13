import { z } from 'zod';
export class CreateEmployeeRequest {
  name: string;
  email: string;
  owner_id: string;

  constructor(data: { name: string; email: string; owner_id: string }) {
    this.name = data.name;
    this.email = data.email;
    this.owner_id = data.owner_id;
  }

  static schema() {
    return z.object({
      name: z.string().min(5).max(255),
      email: z.string().email(),
      owner_id: z.string().uuid(),
    });
  }
}
