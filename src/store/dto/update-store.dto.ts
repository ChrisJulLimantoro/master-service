import { z } from 'zod';
export class UpdateStoreRequest {
  code: string | null;
  name: string | null;
  npwp: string | null;
  address: string | null;
  open_date: Date | null;
  longitude: number | null;
  latitude: number | null;
  information: string | null;

  constructor(data: {
    code: string | null;
    name: string | null;
    npwp: string | null;
    address: string | null;
    open_date: Date | null;
    longitude: number | null;
    latitude: number | null;
    information: string | null;
  }) {
    this.code = data.code;
    this.name = data.name;
    this.npwp = data.npwp;
    this.address = data.address;
    this.open_date = data.open_date;
    this.longitude = data.longitude;
    this.latitude = data.latitude;
    this.information = data.information;
  }

  static schema() {
    return z.object({
      code: z.string().max(5).optional(),
      name: z.string().min(5).optional(),
      npwp: z.string().length(15).optional(),
      address: z.string().min(10).optional(),
      open_date: z.date().optional(),
      longitude: z.number().optional(),
      latitude: z.number().optional(),
      information: z.string().nullable().optional(),
    });
  }
}
