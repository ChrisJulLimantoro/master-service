import { z } from 'zod';
export class UpdateStoreRequest {
  name: string;

  constructor(data: { name: string }) {
    this.name = data.name;
  }

  static schema() {
    return z.object({
      name: z.string().min(5),
    });
  }
}
