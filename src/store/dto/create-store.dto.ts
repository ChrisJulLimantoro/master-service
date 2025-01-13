import { z } from 'zod';
export class CreateStoreRequest {
  code: string;
  name: string;
  company_id: string;
  npwp: string;
  address: string;
  open_date: Date;
  longitude: number;
  latitude: number;
  information: string | null;

  constructor(data: {
    code: string;
    name: string;
    company_id: string;
    npwp: string;
    address: string;
    open_date: Date;
    longitude: number;
    latitude: number;
    information: string | null;
  }) {
    this.code = data.code;
    this.name = data.name;
    this.company_id = data.company_id;
    this.npwp = data.npwp;
    this.address = data.address;
    this.open_date = new Date(data.open_date);
    this.longitude = data.longitude;
    this.latitude = data.latitude;
    this.information = data.information;
  }

  static schema() {
    return z.object({
      code: z.string().max(5),
      name: z.string().min(5),
      company_id: z.string().uuid(),
      npwp: z.string().length(15),
      address: z.string().min(10),
      open_date: z.date(),
      longitude: z.number().min(-180).max(180),
      latitude: z.number().min(-90).max(90),
      information: z.string().nullable().optional(),
    });
  }
}
