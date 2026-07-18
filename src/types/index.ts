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
  /** Koordinate ročno izbrane na zemljevidu (ni uradni naslov). */
  fromMap?: boolean;
}

export interface User {
  id?: number;
  public_id?: string;
  email: string;
  role?: "member" | "vip" | "team" | "admin";
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
  subscription_period_start?: string;
  subscription_period_end?: string;
  season_pass_expires_at?: string;
  pdf_reports_available?: boolean;
  archive_full_access?: boolean;
  payments_enabled?: boolean;
  widget_active?: boolean;
  widget_configured?: boolean;
}

export interface BillingHistoryItem {
  id: string;
  kind: "token_purchase" | "subscription" | "subscription_renewal" | "other";
  occurred_at: string;
  amount_cents: number;
  currency: string;
  amount_eur: string;
  status: string;
  status_sl: string;
  description_sl: string;
  plan_id?: string | null;
  credits_added?: number | null;
  document_url?: string | null;
  fiscal_invoice_id?: number | null;
  fiscal_status_sl?: string | null;
}

export interface BillingHistory {
  items: BillingHistoryItem[];
  billing_portal_available: boolean;
  page?: number;
  page_size?: number;
  total_count?: number;
  total_pages?: number;
  total_paid_cents?: number;
  total_paid_eur?: string;
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
  /** true, ko zemljevid kaže vzorec (npr. 1500 od N), ne vseh točk. */
  map_strikes_sampled?: boolean;
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
  forgotPasswordEmail: string;
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

export interface AdminStrelkoSummary {
  invoice_total: number;
  invoice_failed: number;
  invoice_pending: number;
  invoice_fiscalized: number;
  furs_enabled: boolean;
}

export interface AdminStrelkoInvoice {
  id: number;
  invoice_number: string;
  user_id: number;
  user_email?: string | null;
  issued_at: string;
  buyer_email?: string | null;
  buyer_name?: string | null;
  plan_id?: string | null;
  description_sl: string;
  quantity?: number | null;
  gross_cents: number;
  furs_status: string;
  furs_error?: string | null;
  zoi?: string | null;
  eor?: string | null;
  stripe_session_id?: string | null;
  stripe_invoice_id?: string | null;
  email_sent_at?: string | null;
}

export interface AdminStrelkoUser {
  id: number;
  email: string;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  credits_balance: number;
  plan_id?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  season_pass_expires_at?: string | null;
  subscription_period_end?: string | null;
  podpornik_active: boolean;
  podpornik_manual?: boolean;
  subscription_cancel_at_period_end?: boolean | null;
  created_at?: string | null;
}

export interface AdminStrelkoCreditTransaction {
  id: number;
  amount: number;
  reason: string;
  stripe_session_id?: string | null;
  stripe_invoice_id?: string | null;
  created_at: string;
}

export interface AdminStrelkoUserDetail extends AdminStrelkoUser {
  transactions: AdminStrelkoCreditTransaction[];
  invoices: AdminStrelkoInvoice[];
  can_delete?: boolean;
  delete_block_reasons?: string[];
}

export interface AdminStrelkoUserList {
  items: AdminStrelkoUser[];
  total: number;
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface AdminStrelkoReconcileResult {
  lookback_days: number;
  stripe_paid_count: number;
  invoice_count: number;
  missing_count: number;
  failed_count: number;
  email_sent: boolean;
  missing: Array<Record<string, unknown>>;
  failed: Array<Record<string, unknown>>;
  issued_count: number;
  issued: Array<Record<string, unknown>>;
}

export interface AdminStrelkoSmsSummary {
  sms_provider_configured: boolean;
  sms_enabled: boolean;
  sms_provider?: string;
  sms_credits_available?: number | null;
  sms_credits_has_balance?: boolean | null;
  sms_credits_note?: string | null;
  subscribers_active: number;
  subscribers_total: number;
  sent_this_month: number;
  sent_strike_this_month: number;
  sent_manual_this_month?: number;
  sent_meteoalarm_this_month: number;
  sent_total?: number;
  sent_strike_auto_total?: number;
  sent_manual_total?: number;
  cooldown_minutes: number;
  max_per_day?: number;
  lookback_minutes: number;
}

export interface AdminStrelkoSmsScenario {
  id: string;
  title: string;
  description: string;
  production_default: boolean;
  sample_message: string;
  sample_length: number;
  sample_credits: number;
}

export interface AdminStrelkoSmsScenarioList {
  items: AdminStrelkoSmsScenario[];
  production_scenario_id: string;
}

export interface AdminStrelkoSmsPreview {
  user_id: number;
  phone?: string | null;
  message: string;
  strike_count: number;
  nearest_km?: number | null;
  preview_mode: string;
  scenario_id: string;
  scenario_title?: string | null;
  note?: string | null;
  gsm_length: number;
  sms_credits_estimate: number;
}

export interface AdminStrelkoSmsSendResult {
  ok: boolean;
  message: string;
  provider: string;
  gsm_length: number;
  sms_credits_estimate: number;
  message_id?: string | null;
  error_message?: string | null;
}

export interface AdminStrelkoSmsNotification {
  id: number;
  kind: "strike" | "auto_strike" | "manual" | "meteoalarm" | string;
  user_id: number;
  user_email?: string | null;
  phone: string;
  created_at: string;
  strike_count?: number | null;
  nearest_km?: number | null;
  warning_identifier?: string | null;
  awareness_level?: string | null;
  event?: string | null;
  sms_body?: string | null;
  preview_mode?: string | null;
}

export interface AdminStrelkoSmsSubscriber {
  user_id: number;
  email: string;
  role: string;
  plan_id?: string | null;
  alert_enabled: boolean;
  sms_alerts_admin_granted?: boolean;
  sms_eligible?: boolean;
  alert_phone?: string | null;
  saved_label?: string | null;
  saved_lat?: number | null;
  saved_lon?: number | null;
  alert_radius_km: number;
  sms_sent_this_month: number;
  sms_sent_auto_this_month?: number;
  sms_sent_manual_this_month?: number;
  sms_sent_total?: number;
  sms_sent_strike_total?: number;
  sms_sent_manual_total?: number;
  sms_sent_meteo_total?: number;
}

export interface AdminStrelkoSmsSubscriberUpsert {
  user_email: string;
  alert_phone: string;
  saved_lat: number;
  saved_lon: number;
  saved_label?: string | null;
  alert_radius_km?: number;
}
