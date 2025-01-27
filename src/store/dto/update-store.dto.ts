import { z } from 'zod';
export class UpdateStoreRequest {
  code: string | null;
  name: string | null;
  npwp: string | null;
  address: string | null;
  open_date: Date | null;
  longitude: number | null;
  latitude: number | null;
  description: string | null;
  is_active: boolean | null;
  is_flex_price: boolean | null;
  is_float_price: boolean | null;
  poin_config: number | null;
  logo: string | null;

  constructor(data: {
    code: string | null;
    name: string | null;
    npwp: string | null;
    address: string | null;
    open_date: Date | null;
    longitude: number | null;
    latitude: number | null;
    description: string | null;
    is_active: boolean | null;
    is_flex_price: boolean | null;
    is_float_price: boolean | null;
    poin_config: string | null;
    logo: string | null;
  }) {
    this.code = data.code;
    this.name = data.name;
    this.npwp = data.npwp;
    this.address = data.address;
    this.open_date = new Date(data.open_date);
    this.longitude = parseFloat(data.longitude.toString());
    this.latitude = parseFloat(data.latitude.toString());
    this.description = data.description;
    this.is_active = data.is_active;
    this.is_flex_price = data.is_flex_price;
    this.is_float_price = data.is_float_price;
    this.poin_config = parseInt(data.poin_config);
    this.logo = data.logo;
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
      description: z.string().nullable().optional(),
      is_active: z.boolean().nullable().optional(),
      is_flex_price: z.boolean().nullable().optional(),
      is_float_price: z.boolean().nullable().optional(),
      poin_config: z.number().nullable().optional(),
      logo: z.string().nullable().optional(),
    });
  }
}
