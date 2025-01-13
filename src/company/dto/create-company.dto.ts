import { z } from 'zod';
export class CreateCompanyRequest {
  code: string;
  name: string;
  owner_id: string;

  constructor(data: { code: string; name: string; owner_id: string }) {
    this.code = data.code;
    this.name = data.name;
    this.owner_id = data.owner_id;
  }

  static schema() {
    return z.object({
      code: z.string().max(5),
      name: z.string().min(5).max(255),
      owner_id: z.string().uuid(),
    });
  }
}
