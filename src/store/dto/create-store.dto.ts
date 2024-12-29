import { z } from 'zod';
export class CreateStoreRequest {
  name: string;
  company_id: string;

  constructor(data: { name: string; company_id: string }) {
    this.name = data.name;
    this.company_id = data.company_id;
  }

  static schema() {
    return z.object({
      name: z.string().min(5),
      company_id: z.string().uuid(),
    });
  }
}
