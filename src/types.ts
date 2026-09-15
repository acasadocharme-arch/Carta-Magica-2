export type PlanType = "free" | "pro";

export type MessageStyle = "mágico" | "emocionante" | "divertido" | "carinhoso";

export interface ShippingAddress {
  recipientName: string;
  street: string;
  number: string;
  complement?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Letter {
  id: string;
  childName: string;
  age: number;
  city: string;
  achievements: string;
  giftRequest: string;
  parentNotes?: string;
  style: MessageStyle;
  plan: PlanType;
  content: string;
  date: string;
  token: string;
  photoUrl?: string;
  secretMessage?: string;
  childReaction?: string;
  deliveryStatus?: "digital_only" | "processing" | "printed" | "dispatched" | "delivered";
  trackingCode?: string;
  shippingAddress?: ShippingAddress;
}

export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  ref?: string;
}

export type AnalyticsEvent = 
  | "landing_view"
  | "start_letter"
  | "form_started"
  | "form_completed"
  | "letter_generated"
  | "letter_opened"
  | "pro_viewed"
  | "checkout_started"
  | "purchase_completed"
  | "audio_played"
  | "video_started"
  | "pdf_downloaded"
  | "pdf_generation_started"
  | "png_downloaded"
  | "png_generation_started"
  | "candy_game_started"
  | "candy_game_toggled"
  | "whatsapp_shared"
  | "link_copied"
  | "photo_uploaded"
  | "new_letter_from_shared_page";

export interface Order {
  orderId: string;
  letterId: string;
  childName: string;
  amount: number;
  plan: "pro";
  includePhysicalDispatch: boolean;
  status: "pending" | "paid" | "failed" | "refunded";
  paymentMethod: string;
  createdAt: string;
  paidAt?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: "customer" | "admin";
}

export interface AdminMetrics {
  totalLetters: number;
  totalLettersGenerated: number;
  proLetters: number;
  freeLetters: number;
  conversionRate: number;
  proConversionRate: number;
  totalRevenue: number;
  physicalDispatches: number;
  todayLetters: number;
  recentLetters: Letter[];
  recentOrders: Order[];
  systemHealth: {
    geminiStatus: string;
    ttsStatus: string;
    pdfStatus: string;
    logisticsStatus: string;
  };
}

export interface PostalServiceOption {
  carrier: string;
  deliveryTime: string;
  price: number;
  includes: string[];
}
