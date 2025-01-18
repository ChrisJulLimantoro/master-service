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
  is_active: boolean | null;
  is_flex_price: boolean | null;
  is_float_price: boolean | null;
  poin_config: number | null;

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
    is_active: boolean | null;
    is_flex_price: boolean | null;
    is_float_price: boolean | null;
    poin_config: number | null;
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
    this.is_active = data.is_active;
    this.is_flex_price = data.is_flex_price;
    this.is_float_price = data.is_float_price;
    this.poin_config = data.poin_config;
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
      is_active: z.boolean().nullable().optional(),
      is_flex_price: z.boolean().nullable().optional(),
      is_float_price: z.boolean().nullable().optional(),
      poin_config: z.number().nullable().optional(),
    });
  }
}
