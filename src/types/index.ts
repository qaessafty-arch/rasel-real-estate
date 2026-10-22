export type PropertyType = 
  | 'house' 
  | 'apartment' 
  | 'villa' 
  | 'shop' 
  | 'office' 
  | 'commercial_land' 
  | 'agriculture_land' 
  | 'building';

export type PropertyPurpose = 'sale' | 'rent' | 'exchange' | 'investment';

export type PaymentMethod = 'cash' | 'installments' | 'both' | 'exchange';

export type PropertyCondition = 'brand_new' | 'used';

export type PropertyStatus = 'available' | 'rented' | 'sold' | 'reserved' | 'under_maintenance';

export type Currency = 'USD' | 'IQD';

export interface LandDetails {
  frontage_meter?: number; // بەرەی شەقام بە مەتر
  street_width?: number; // پانی شەقام
  is_corner?: boolean; // گۆشەیە یان نا
  zoning_type?: string; // سڕف، زراعی، تجاری، تاپۆ
  area_donum?: number; // دۆنم
  area_olk?: number; // ئۆڵک
}

export interface Property {
  id: string;
  property_code: string; // e.g. RSL-101
  title: string;
  property_type: PropertyType;
  purpose: PropertyPurpose; // فرۆشتن، کرێ، گۆڕینەوە/موقایەزە، وەبەرهێنان
  status: PropertyStatus;
  
  // Pricing & Payment Methods
  price: number;
  currency: Currency;
  payment_method?: PaymentMethod; // نەقد، قیست، هەردووکی
  down_payment?: number; // پێشەکی
  installment_amount?: number; // بڕی هەر قیستێک
  installment_cycle?: 'monthly' | 'quarterly' | 'yearly'; // جۆری قیستەکان
  installment_count?: number; // ژمارەی قیستەکان
  rental_period?: 'monthly' | 'yearly' | 'daily' | null;

  // Project & Timeline
  project_name?: string; // ناوی پڕۆژە / تاوەر / کۆمەڵگە
  floor_number?: string | number; // نهۆم
  condition?: PropertyCondition; // بەکارنەهاتوو (نوێ) / بەکارهاتوو
  construction_start_date?: string; // دەستبەکاربوون
  completion_date?: string; // کاتی تەواوبوون

  // Location & Specs
  area_sqm: number;
  city: string;
  neighborhood: string;
  address: string;
  lat?: number | null;
  lng?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  floors?: number | null;
  year_built?: number | null;
  features: string[];

  // Detailed Land Specs (بۆ زەوی بە ورد و درشتییەوە)
  land_details?: LandDetails;

  // Media
  images: string[];
  video_url?: string; // بەستەری ڤیدیۆ (YouTube / Video Link)
  documents?: { name: string; url: string; size?: string }[];
  notes?: string;

  // Stakeholders & Commissions
  owner_contact?: {
    name: string;
    phone: string;
    notes?: string;
  };
  agency_name?: string; // ناوی عەقار / نوسینگە
  freelancer_name?: string; // ناوی فریلانسەر / برۆکەر
  commission_amount?: number; // وەرگرتنی عەمولە
  net_to_owner?: number; // گەڕانەوە بۆ خاوەن

  is_featured?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: string;
  property_id: string;
  property_code: string;
  property_title: string;
  type: 'rent' | 'sale' | 'exchange';
  client_name: string;
  client_phone: string;
  client_national_id?: string;
  start_date: string;
  end_date?: string | null;
  total_amount: number;
  paid_amount: number;
  currency: Currency;
  payment_cycle?: 'monthly' | 'one_time' | 'quarterly' | 'yearly';
  next_payment_date?: string | null;
  status: 'active' | 'completed' | 'terminated' | 'overdue';
  notes?: string;
  created_at: string;
}

export type TransactionType = 'income' | 'expense';

export type TransactionCategory = 
  | 'rent_collected' 
  | 'sale_commission' 
  | 'maintenance' 
  | 'utility_fee' 
  | 'renovation' 
  | 'legal_tax' 
  | 'marketing' 
  | 'other';

export interface FinancialTransaction {
  id: string;
  property_id?: string | null;
  property_code?: string | null;
  property_title?: string | null;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  currency: Currency;
  date: string;
  title: string;
  description?: string;
  payer_or_payee?: string;
  receipt_number?: string;
  created_at: string;
}

export interface SystemStats {
  totalProperties: number;
  availableProperties: number;
  rentedProperties: number;
  soldProperties: number;
  monthlyRentalIncomeUSD: number;
  monthlyRentalIncomeIQD: number;
  totalExpensesUSD: number;
  totalExpensesIQD: number;
  netProfitUSD: number;
  totalInvestmentValueUSD: number;
}
