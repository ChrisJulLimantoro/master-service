import { z } from 'zod';
export class CreateCompanyRequest {
  name: string;
  owner_id: string;

  constructor(data: { name: string; owner_id: string }) {
    this.name = data.name;
    this.owner_id = data.owner_id;
  }

  static schema() {
    return z.object({
      name: z.string().min(5),
      owner_id: z.string().uuid(),
    });
  }
}
