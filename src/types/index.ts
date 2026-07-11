export type AppView =
  | "landing"
  | "zavarovalnica"
  | "statistika"
  | "widget-obcine"
  | "preview-teaser"
  | "preview-no-strikes"
  | "results";

export type StatTab = "grafi" | "zemljevid";
export type AuthMode = "login" | "register";

export interface GeocodeResult {
  label: string;
  lat: number;
  lon: number;
}

export interface User {
  id: number;
  email: string;
  is_active?: boolean;
}

export interface Credits {
  credits_balance?: number;
  plan_id?: string;
  plan_name_sl?: string;
  has_subscription?: boolean;
  billing_portal_available?: boolean;
  subscription_cancel_at_period_end?: boolean;
  subscription_current_period_end?: string;
  season_pass_expires_at?: string;
  pdf_reports_available?: boolean;
  archive_full_access?: boolean;
  payments_enabled?: boolean;
  widget_active?: boolean;
  widget_configured?: boolean;
}

export interface UserWidgetConfig {
  active: boolean;
  configured: boolean;
  lat: number | null;
  lon: number | null;
  label: string | null;
  domain: string | null;
  public_key: string | null;
  embed_html: string | null;
  expires_at: string | null;
}

export interface PlansMeta {
  season_label_sl?: string;
  archive_free_now?: boolean;
  in_lightning_season?: boolean;
}

export interface Plan {
  id: string;
  name_sl: string;
  tagline_sl?: string;
  price_eur?: string;
  price_gross_eur?: string;
  price_net_eur?: string;
  price_vat_eur?: string;
  price_suffix_sl?: string;
  billing_mode?: string;
  monthly_credits?: number;
  max_locations?: number;
  pdf_per_period?: number;
  features_sl?: string[];
  recommended?: boolean;
  contact_only?: boolean;
  contact_email?: string;
  vat_rate_percent?: number;
}

export type PreviewScreen = "teaser" | "no-strikes" | null;

export interface AlertsSettings {
  alert_enabled?: boolean;
  alert_email_enabled?: boolean;
  alert_phone?: string | null;
  saved_lat?: number | null;
  saved_lon?: number | null;
  saved_label?: string | null;
  alert_radius_km?: number;
  sms_eligible?: boolean;
  sms_available?: boolean;
  sms_monthly_limit?: number;
  sms_sent_this_month?: number;
  email_available?: boolean;
  email_eligible?: boolean;
  email_verified?: boolean;
  account_email?: string | null;
  email_monthly_limit?: number;
  emails_sent_this_month?: number;
}

export interface HourlyChartData {
  datum: string;
  hours: { hour: number; count: number }[];
  total: number;
}

export interface PreviewResult {
  has_nearby_strikes: boolean;
  message_sl: string;
  requires_login?: boolean;
  location_label?: string;
  total_strikes?: number;
  days_with_strikes?: number;
  nearest_km?: number;
  nearest_date?: string;
  date_from?: string;
  date_to?: string;
  period_days?: number;
  teaser_daily?: { datum: string; stevilo_strel: number }[];
}

export interface InsufficientTokensDetail {
  message?: string;
  required_tokens: number;
  available_tokens: number;
}

export interface DailyStrike {
  datum: string;
  stevilo_strel: number;
  oddaljenost_najblizje_km?: number | null;
  cas_najblizje_strele?: string | null;
}

export interface StrikePoint {
  lat: number;
  lon: number;
  ts_utc: string;
  distance_km: number;
}

export interface SearchResult {
  lat: number;
  lon: number;
  radius_km: number;
  location_label?: string;
  date_from: string;
  date_to: string;
  total_strikes: number;
  daily: DailyStrike[];
  strikes?: StrikePoint[];
  credits_remaining: number;
  period_days?: number;
}

export interface SavedQuerySummary {
  id: string;
  label: string | null;
  lat: number;
  lon: number;
  radius_km: number;
  date_from: string;
  date_to: string;
  tokens_spent: number;
  total_strikes: number;
  pdf_tokens_cost: number;
  pdf_button_label: string;
  pdf_cost_hint: string;
  created_at: string;
}

export interface SavedQueryOut extends SavedQuerySummary {
  token_balance: number;
  replay: boolean;
  result: Record<string, unknown>;
}

export interface SavedQueryListOut {
  queries: SavedQuerySummary[];
  token_balance: number;
}

export interface QueryQuoteOut {
  query_tokens_cost: number;
  query_button_label: string;
  query_cost_hint: string;
  token_balance: number;
}

export interface WidgetObcina {
  ob_mid: number;
  name: string;
}

export interface WidgetState {
  publicWidgetObMid: number | null;
  publicWidgetObMids: number[];
  publicWidgetObcine: WidgetObcina[];
  publicWidgetScope: "slovenija" | null;
  publicWidgetTheme: "dark" | "light";
  publicWidgetPreviewSize: "compact" | "full";
  publicWidgetLat: number | null;
  publicWidgetLon: number | null;
  publicWidgetLabel: string;
}

export interface ApiError extends Error {
  status?: number;
  data?: unknown;
}

export interface ModalState {
  auth: AuthMode | null;
  credits: boolean;
  alerts: boolean;
  widget: boolean;
  forgotPassword: boolean;
  checkoutSuccess: {
    creditsAdded: number;
    balance: number;
    planName?: string;
    planId?: string;
  } | null;
  creditsOptions: {
    insufficientCredits?: boolean;
    checkoutError?: string;
    meteoalarmUpsell?: boolean;
  };
}
