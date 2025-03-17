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
  wa_number: string;
  description: string | null;
  is_active: boolean | null;
  is_flex_price: boolean | null;
  is_float_price: boolean | null;
  poin_config: number | null;
  tax_percentage: number | null;
  tax_purchase: number | null;
  logo: string;

  constructor({
    code,
    name,
    company_id,
    npwp,
    address,
    open_date,
    longitude,
    latitude,
    description,
    wa_number,
    is_active,
    is_flex_price,
    is_float_price,
    poin_config,
    tax_percentage,
    logo,
    tax_purchase,
  }) {
    this.code = code;
    this.name = name;
    this.company_id = company_id;
    this.npwp = npwp;
    this.address = address;
    this.open_date = new Date(open_date);
    this.longitude = longitude;
    this.latitude = latitude;
    this.description = description;
    this.wa_number = wa_number;
    this.is_active = is_active;
    this.is_flex_price = is_flex_price;
    this.is_float_price = is_float_price;
    this.poin_config = parseInt(poin_config);
    this.tax_percentage = parseFloat(tax_percentage);
    this.logo = logo;
    this.tax_purchase = parseFloat(tax_purchase);
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
      wa_number: z.string().min(1),
      latitude: z.number().min(-90).max(90),
      description: z.string().nullable().optional(),
      is_active: z.boolean().nullable().optional(),
      is_flex_price: z.boolean().nullable().optional(),
      is_float_price: z.boolean().nullable().optional(),
      poin_config: z.number().nullable().optional(),
      tax_percentage: z.number().nullable().optional(),
      tax_purchase: z.number().nullable().optional(),
      logo: z.string().max(255),
    });
  }
}
