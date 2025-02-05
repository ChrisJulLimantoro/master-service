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
  description: string | null;
  is_active: boolean | null;
  is_flex_price: boolean | null;
  is_float_price: boolean | null;
  poin_config: number | null;
  tax_percentage: number | null;
  logo: string;

  constructor(data: {
    code: string;
    name: string;
    company_id: string;
    npwp: string;
    address: string;
    open_date: Date;
    longitude: number;
    latitude: number;
    description: string | null;
    is_active: boolean | null;
    is_flex_price: boolean | null;
    is_float_price: boolean | null;
    poin_config: string | null;
    tax_percentage: number | null;
    logo: string;
  }) {
    this.code = data.code;
    this.name = data.name;
    this.company_id = data.company_id;
    this.npwp = data.npwp;
    this.address = data.address;
    this.open_date = new Date(data.open_date);
    this.longitude = data.longitude;
    this.latitude = data.latitude;
    this.description = data.description;
    this.is_active = data.is_active;
    this.is_flex_price = data.is_flex_price;
    this.is_float_price = data.is_float_price;
    this.poin_config = parseInt(data.poin_config);
    this.tax_percentage = data.tax_percentage;
    this.logo = data.logo;
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
      description: z.string().nullable().optional(),
      is_active: z.boolean().nullable().optional(),
      is_flex_price: z.boolean().nullable().optional(),
      is_float_price: z.boolean().nullable().optional(),
      poin_config: z.number().nullable().optional(),
      tax_percentage: z.number().nullable().optional(),
      logo: z.string().max(255),
    });
  }
}
