import { z } from 'zod';
export class UpdateCompanyRequest {
  code: string | null;
  name: string | null;

  constructor(data: { code: string | null; name: string | null }) {
    this.code = data.code;
    this.name = data.name;
  }

  static schema() {
    return z.object({
      code: z.string().max(5).optional(),
      name: z.string().min(5).max(255).optional(),
    });
  }
}
