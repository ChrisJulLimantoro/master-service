import { z } from 'zod';
export class CreateOwnerRequest {
  name: string;
  email: string;
  password: string;

  constructor(data: { name: string; email: string; password: string }) {
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
  }

  static schema() {
    return z.object({
      name: z.string().min(5).max(255),
      email: z.string().email(),
      password: z.string().min(8).max(50),
    });
  }
}
