import { z } from 'zod';
export class CreateCompanyRequest {
  code: string;
  name: string;
  owner_id: string;
  description: string | null;

  constructor(data: {
    code: string;
    name: string;
    owner_id: string;
    description: string | null;
  }) {
    this.code = data.code;
    this.name = data.name;
    this.owner_id = data.owner_id;
    this.description = data.description;
  }

  static schema() {
    return z.object({
      code: z.string().min(2).max(5),
      name: z.string().min(5).max(255),
      owner_id: z.string().uuid(),
      description: z.string().max(255).nullable().optional(),
    });
  }
}
