import { z } from 'zod';
export class UpdateStoreRequest {
  code: string | null;
  name: string | null;
  npwp: string | null;
  address: string | null;
  open_date: Date | null;
  longitude: number | null;
  latitude: number | null;
  wa_number: string | null;
  description: string | null;
  is_active: boolean | null;
  is_flex_price: boolean | null;
  is_float_price: boolean | null;
  poin_config: number | null;
  tax_percentage: number | null;
  logo: string | null;
  tax_purchase: number | null;
  grace_period: number | null;
  percent_tt_adjustment: number | null;
  fixed_tt_adjustment: number | null;
  percent_kbl_adjustment: number | null;
  fixed_kbl_adjustment: number | null;

  constructor(data: {
    code: string | null;
    name: string | null;
    npwp: string | null;
    address: string | null;
    open_date: Date | null;
    longitude: number | null;
    latitude: number | null;
    wa_number: string | null;
    description: string | null;
    is_active: boolean | null;
    is_flex_price: boolean | null;
    is_float_price: boolean | null;
    poin_config: string | null;
    tax_percentage: string | null;
    logo: string | null;
    tax_purchase: string | null;
    grace_period: string | null;
    percent_tt_adjustment: string | null;
    fixed_tt_adjustment: string | null;
    percent_kbl_adjustment: string | null;
    fixed_kbl_adjustment: string | null;
  }) {
    this.code = data.code;
    this.name = data.name;
    this.npwp = data.npwp;
    this.address = data.address;
    this.open_date = new Date(data.open_date);
    this.longitude = parseFloat(data.longitude.toString());
    this.latitude = parseFloat(data.latitude.toString());
    this.description = data.description;
    this.wa_number = data.wa_number;
    this.is_active = data.is_active;
    this.is_flex_price = data.is_flex_price;
    this.is_float_price = data.is_float_price;
    this.poin_config = parseInt(data.poin_config);
    this.tax_percentage = parseFloat(data.tax_percentage);
    this.logo = data.logo;
    this.tax_purchase = parseFloat(data.tax_purchase);
    this.grace_period = parseInt(data.grace_period);
    this.percent_tt_adjustment = parseFloat(data.percent_tt_adjustment);
    this.fixed_tt_adjustment = parseFloat(data.fixed_tt_adjustment);
    this.percent_kbl_adjustment = parseFloat(data.percent_kbl_adjustment);
    this.fixed_kbl_adjustment = parseFloat(data.fixed_kbl_adjustment);
  }

  static schema() {
    return z.object({
      code: z.string().max(5).optional(),
      name: z.string().min(5).optional(),
      npwp: z.string().length(15).optional(),
      address: z.string().min(10).optional(),
      open_date: z.date().optional(),
      longitude: z.number().optional(),
      wa_number: z.string().optional(),
      latitude: z.number().optional(),
      description: z.string().nullable().optional(),
      is_active: z.boolean().nullable().optional(),
      is_flex_price: z.boolean().nullable().optional(),
      is_float_price: z.boolean().nullable().optional(),
      poin_config: z.number().nullable().optional(),
      tax_percentage: z.number().nullable().optional(),
      logo: z.string().nullable().optional(),
      tax_purchase: z.number().nullable().optional(),
      grace_period: z.number().nullable().optional(),
      percent_tt_adjustment: z.number().max(100).nullable().optional(),
      fixed_tt_adjustment: z.number().nullable().optional(),
      percent_kbl_adjustment: z.number().max(100).nullable().optional(),
      fixed_kbl_adjustment: z.number().nullable().optional(),
    });
  }
}
