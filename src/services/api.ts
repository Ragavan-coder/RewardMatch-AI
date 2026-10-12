/**
 * Unified API client connecting React frontend to Django REST Framework & MySQL backend.
 * Integrates live financial profiles, savings analytics, monitoring, and RAG.
 */

import type { CreditCard, RewardItem, TransactionActivity } from '../types';
import { MOCK_CARDS, MOCK_REWARDS, MOCK_ACTIVITIES } from '../data/mockData';

const API_BASE_URL = 'http://127.0.0.1:8000';

export function getAuthHeaders(extraHeaders: HeadersInit = {}): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('rewardmatch_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };
}

export interface CardOnboardingItem {
  name: string;
  bank_name?: string;
  last_4: string;
  network?: string;
  credit_limit?: number;
  reward_points?: number;
  rupay_on_upi?: boolean;
}

export interface BankOnboardingItem {
  bank_name: string;
  account_type?: string;
  last_4: string;
  upi_id?: string;
  primary_upi_app?: string;
  is_primary?: boolean;
  rupay_credit_linked?: boolean;
}

export interface BankAccount {
  id: number;
  user_id: number;
  bank_name: string;
  account_type: string;
  account_number_masked: string;
  upi_id?: string | null;
  primary_upi_app: string;
  is_primary: boolean;
  rupay_credit_linked: boolean;
  created_at?: string;
}

export interface AuthUserData {
  id: number;
  name: string;
  email: string;
  is_demo: boolean;
  phone?: string | null;
  monthly_spend?: number;
  primary_category?: string;
  primary_bank?: string | null;
  primary_upi_id?: string | null;
  primary_upi_app?: string;
  profile_completed?: boolean;
  cards_count?: number;
  bank_accounts_count?: number;
  bank_accounts?: BankAccount[];
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: AuthUserData;
}

export interface BackendCard {
  id: number;
  name: string;
  tier: string;
  card_number_masked: string;
  network: string;
  accent_color: string;
  credit_limit: number;
  available_limit: number;
  reward_points: number;
  cashback_earned: number;
  annual_fee: number;
  dining_multiplier: number;
  travel_multiplier: number;
  shopping_multiplier: number;
}

export interface BackendReward {
  id: number;
  title: string;
  value: string;
  reward_type: string;
  code: string;
  category: string;
  expiry: string;
  is_claimed: boolean;
  is_revealed: boolean;
}

export interface BackendTransaction {
  id: number;
  merchant: string;
  category: string;
  amount: number;
  cashback_earned: number;
  card_used: string;
  status: string;
  created_at: string;
}

export interface BestCardRecommendation {
  recommended_card: string;
  tier: string;
  estimated_savings: number;
  cashback_rate: string;
  reason: string;
  alternative_cards: Array<{
    card_name: string;
    tier: string;
    savings: number;
    rate: string;
    perk: string;
  }>;
}

export interface SwipeSimulationResult {
  card_name: string;
  amount: number;
  category: string;
  rate: string;
  cashback_earned: number;
  new_reward_points: number;
  status: string;
}

// ==========================================
// MAPPERS: Backend SQL Schema -> Frontend Types
// ==========================================

export function mapBackendCardToCreditCard(bc: BackendCard): CreditCard {
  // Find matching template in mock cards for gradient / category icons
  const template = MOCK_CARDS.find((c) => c.tier.toLowerCase() === bc.tier.toLowerCase()) || MOCK_CARDS[0];

  return {
    id: String(bc.id),
    name: bc.name,
    tier: (bc.tier as 'Platinum' | 'Gold' | 'Cashback') || template.tier,
    cardNumberMasked: bc.card_number_masked,
    cardHolder: 'RAGAVAN',
    expiry: template.expiry,
    network: (bc.network as 'VISA' | 'Mastercard' | 'RuPay') || template.network,
    accentColor: bc.accent_color || template.accentColor,
    secondaryColor: template.secondaryColor,
    gradient: template.gradient,
    creditLimit: bc.credit_limit,
    availableLimit: bc.available_limit,
    rewardPoints: bc.reward_points,
    cashbackEarned: bc.cashback_earned,
    annualFee: bc.annual_fee,
    highlightBenefit: `${bc.dining_multiplier}X on Dining • ${bc.travel_multiplier}X on Travel • ${bc.shopping_multiplier}X on Shopping`,
    categories: [
      { name: 'Dining & Food', rate: `${bc.dining_multiplier}% Cashback`, icon: 'Utensils' },
      { name: 'Travel & Flights', rate: `${bc.travel_multiplier}X Points`, icon: 'Plane' },
      { name: 'Shopping & Marts', rate: `${bc.shopping_multiplier}% Back`, icon: 'ShoppingBag' },
    ],
  };
}

export function mapBackendRewardToRewardItem(br: BackendReward): RewardItem {
  const iconMap: Record<string, 'gift' | 'percent' | 'indian-rupee' | 'plane'> = {
    voucher: 'gift',
    discount: 'percent',
    cashback: 'indian-rupee',
    travel: 'plane',
    Shopping: 'gift',
    Travel: 'plane',
    Wallet: 'indian-rupee',
  };

  const iconName = iconMap[br.reward_type] || iconMap[br.category] || 'gift';

  return {
    id: String(br.id),
    type: (br.reward_type as 'voucher' | 'discount' | 'points' | 'travel') || 'voucher',
    title: br.title,
    value: br.value,
    code: br.code,
    expiry: br.expiry.includes('Valid') ? br.expiry : `Valid Till ${br.expiry}`,
    description: `Redeemable directly at partner checkout for ${br.value}. Verified by RewardMatch SQL engine.`,
    terms: 'Valid on purchases above ₹1,000. Non-transferable reward coupon.',
    iconName,
    category: br.category || 'Shopping',
    isRevealed: br.is_revealed ?? true,
    claimed: br.is_claimed ?? false,
    colorScheme: {
      bg: 'rgba(255, 48, 56, 0.12)',
      border: 'rgba(255, 48, 56, 0.5)',
      accent: '#FF3038',
      badge: 'bg-red-500/20 text-red-400 border-red-500/30',
    },
  };
}

export function mapBackendTransactionToActivity(bt: BackendTransaction): TransactionActivity {
  return {
    id: String(bt.id),
    merchant: bt.merchant,
    category: bt.category,
    date: bt.created_at ? bt.created_at.split('T')[0] : 'Today',
    amount: bt.amount,
    cashbackEarned: bt.cashback_earned,
    cardUsed: bt.card_used,
    status: (bt.status as 'Completed' | 'Pending') || 'Completed',
  };
}

// ==========================================
// API CLIENT IMPLEMENTATION
// ==========================================

export async function checkBackendHealth(): Promise<{ online: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`, { method: 'GET' });
    if (res.ok) {
      return { online: true, message: 'FastAPI SQL Database Active' };
    }
    return { online: false, message: 'FastAPI Service Error' };
  } catch {
    return { online: false, message: 'Offline Demo Mode' };
  }
}

// 1. Authentication Endpoints
export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Invalid email or password.');
    }

    const data: AuthResponse = await res.json();
    if (data.token) {
      localStorage.setItem('rewardmatch_token', data.token);
      localStorage.setItem('rewardmatch_user', JSON.stringify(data.user));
    }
    return data;
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('Failed to fetch')) {
      return {
        success: true,
        message: 'Authenticated locally via Offline Sandbox.',
        token: 'local_token_' + Date.now(),
        user: { id: 1, name: email.split('@')[0], email, is_demo: false },
      };
    }
    throw err;
  }
}

export interface RegisterExtraDetails {
  phone?: string;
  monthly_spend?: number;
  primary_category?: string;
  primary_bank?: string;
  primary_upi_id?: string;
  primary_upi_app?: string;
  cards?: CardOnboardingItem[];
  bank_accounts?: BankOnboardingItem[];
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
  details?: RegisterExtraDetails
): Promise<AuthResponse> {
  try {
    const payload = {
      name,
      email,
      password,
      phone: details?.phone,
      monthly_spend: details?.monthly_spend,
      primary_category: details?.primary_category,
      primary_bank: details?.primary_bank,
      primary_upi_id: details?.primary_upi_id,
      primary_upi_app: details?.primary_upi_app,
      cards: details?.cards || [],
      bank_accounts: details?.bank_accounts || [],
    };

    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Registration failed.');
    }

    const data: AuthResponse = await res.json();
    if (data.token) {
      localStorage.setItem('rewardmatch_token', data.token);
      localStorage.setItem('rewardmatch_user', JSON.stringify(data.user));
    }
    return data;
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('Failed to fetch')) {
      return {
        success: true,
        message: 'Account registered locally via Sandbox.',
        token: 'local_token_' + Date.now(),
        user: {
          id: 2,
          name,
          email,
          is_demo: false,
          phone: details?.phone,
          primary_bank: details?.primary_bank,
          primary_upi_id: details?.primary_upi_id,
          cards_count: details?.cards?.length || 1,
          bank_accounts_count: details?.bank_accounts?.length || 1,
        },
      };
    }
    throw err;
  }
}

export async function submitOnboarding(payload: {
  user_id?: number;
  email?: string;
  phone?: string;
  monthly_spend?: number;
  primary_category?: string;
  primary_bank?: string;
  primary_upi_id?: string;
  primary_upi_app?: string;
  cards: CardOnboardingItem[];
  bank_accounts: BankOnboardingItem[];
}): Promise<AuthUserData> {
  const res = await fetch(`${API_BASE_URL}/api/auth/onboarding`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Onboarding setup failed.');
  }
  const user: AuthUserData = await res.json();
  localStorage.setItem('rewardmatch_user', JSON.stringify(user));
  return user;
}

export async function fetchUserBankAccounts(userId: number = 1): Promise<BankAccount[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/banks?user_id=${userId}`);
    if (!res.ok) throw new Error('Failed to fetch bank accounts');
    return await res.json();
  } catch {
    return [
      {
        id: 1,
        user_id: userId,
        bank_name: 'HDFC Bank',
        account_type: 'Salary',
        account_number_masked: '•••• •••• 3491',
        upi_id: 'ragavan@okhdfcbank',
        primary_upi_app: 'Google Pay',
        is_primary: true,
        rupay_credit_linked: true,
      },
    ];
  }
}

export async function addUserBankAccount(
  data: BankOnboardingItem,
  userId: number = 1
): Promise<BankAccount> {
  const res = await fetch(`${API_BASE_URL}/api/auth/banks?user_id=${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to add bank account');
  return await res.json();
}

// 2. Credit Cards Endpoints
export async function fetchCards(): Promise<CreditCard[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/cards`);
    if (!res.ok) throw new Error('Failed to fetch cards');
    const backendCards: BackendCard[] = await res.json();
    if (backendCards && backendCards.length > 0) {
      return backendCards.map(mapBackendCardToCreditCard);
    }
    return MOCK_CARDS;
  } catch {
    return MOCK_CARDS;
  }
}

export async function simulateCardSwipe(
  cardId: number | string,
  amount: number,
  category: string
): Promise<SwipeSimulationResult | null> {
  try {
    const numId = typeof cardId === 'string' ? parseInt(cardId, 10) || 1 : cardId;
    const res = await fetch(`${API_BASE_URL}/api/cards/simulate-swipe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ card_id: numId, amount, category }),
    });
    if (!res.ok) throw new Error('Swipe simulation failed');
    return await res.json();
  } catch {
    // Local fallback calculation
    const rate = category === 'Dining' ? '10% Cashback' : category === 'Flights' ? '8% Cashback' : '5% Cashback';
    const rateVal = category === 'Dining' ? 0.1 : category === 'Flights' ? 0.08 : 0.05;
    return {
      card_name: 'RewardMatch Platinum',
      amount,
      category,
      rate,
      cashback_earned: Math.round(amount * rateVal),
      new_reward_points: 15350,
      status: 'Transaction Approved (Offline Sandbox)',
    };
  }
}

// 3. Rewards Endpoints
export async function fetchRewards(): Promise<RewardItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/rewards`);
    if (!res.ok) throw new Error('Failed to fetch rewards');
    const backendRewards: BackendReward[] = await res.json();
    if (backendRewards && backendRewards.length > 0) {
      return backendRewards.map(mapBackendRewardToRewardItem);
    }
    return MOCK_REWARDS;
  } catch {
    return MOCK_REWARDS;
  }
}

export async function claimReward(rewardId: number | string): Promise<{ success: boolean; code: string; message: string } | null> {
  try {
    const numId = typeof rewardId === 'string' ? parseInt(rewardId, 10) || 1 : rewardId;
    const res = await fetch(`${API_BASE_URL}/api/rewards/${numId}/claim`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to claim reward');
    return await res.json();
  } catch {
    return {
      success: true,
      code: 'RWD-CLAIMED-' + rewardId,
      message: 'Voucher claimed locally!',
    };
  }
}

export async function generateScratchReward(): Promise<RewardItem | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/rewards/scratch`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to generate scratch reward');
    const backendReward: BackendReward = await res.json();
    return mapBackendRewardToRewardItem(backendReward);
  } catch {
    // Generate simulated fresh voucher
    const randomAmount = [250, 500, 750, 1000][Math.floor(Math.random() * 4)];
    const code = `LUCKY-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    return {
      id: 'scratch-' + Date.now(),
      type: 'voucher',
      title: `₹${randomAmount} INSTANT FESTIVAL VOUCHER`,
      value: `₹${randomAmount} OFF`,
      code,
      expiry: 'Valid Till 31 Dec 2026',
      description: 'Exclusive AI-matched scratch reward unlocked.',
      terms: 'Valid on select partners.',
      iconName: 'gift',
      category: 'Shopping',
      isRevealed: true,
      claimed: false,
      colorScheme: {
        bg: 'rgba(255, 48, 56, 0.12)',
        border: 'rgba(255, 48, 56, 0.5)',
        accent: '#FF3038',
        badge: 'bg-red-500/20 text-red-400 border-red-500/30',
      },
    };
  }
}

// 4. Transactions Endpoints
export async function fetchTransactions(): Promise<TransactionActivity[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/transactions`);
    if (!res.ok) throw new Error('Failed to fetch transactions');
    const backendTx: BackendTransaction[] = await res.json();
    if (backendTx && backendTx.length > 0) {
      return backendTx.map(mapBackendTransactionToActivity);
    }
    return MOCK_ACTIVITIES;
  } catch {
    return MOCK_ACTIVITIES;
  }
}

// 5. Savings Optimizer Endpoints
export async function optimizeBestCard(
  merchant: string,
  category: string,
  amount: number
): Promise<BestCardRecommendation | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/optimizer/best-card`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ merchant, category, amount }),
    });
    if (!res.ok) throw new Error('Optimization request failed');
    return await res.json();
  } catch {
    // Offline local heuristic calculation
    const catLower = category.toLowerCase();
    if (catLower.includes('dining') || catLower.includes('food')) {
      return {
        recommended_card: 'RewardMatch Platinum',
        tier: 'Platinum',
        estimated_savings: Math.round(amount * 0.1),
        cashback_rate: '10% Cashback',
        reason: `Optimal for ${merchant} (${category}): Platinum provides 10% highest multiplier.`,
        alternative_cards: [
          { card_name: 'RewardMatch Gold', tier: 'Gold', savings: Math.round(amount * 0.05), rate: '5% Cashback', perk: 'Baseline reward' },
          { card_name: 'RewardMatch Cashback', tier: 'Cashback', savings: Math.round(amount * 0.03), rate: '3% Cashback', perk: 'Direct cashback' },
        ],
      };
    } else if (catLower.includes('travel') || catLower.includes('flight')) {
      return {
        recommended_card: 'RewardMatch Gold',
        tier: 'Gold',
        estimated_savings: Math.round(amount * 0.08),
        cashback_rate: '8% Cashback',
        reason: `Optimal for ${merchant} (${category}): Gold provides 8X miles on hotels & flights.`,
        alternative_cards: [
          { card_name: 'RewardMatch Platinum', tier: 'Platinum', savings: Math.round(amount * 0.05), rate: '5% Cashback', perk: 'Airport lounge access' },
        ],
      };
    } else {
      return {
        recommended_card: 'RewardMatch Cashback',
        tier: 'Cashback',
        estimated_savings: Math.round(amount * 0.05),
        cashback_rate: '5% Flat Cashback',
        reason: `Optimal for ${merchant} (${category}): Cashback card yields flat 5% instant statement credit.`,
        alternative_cards: [
          { card_name: 'RewardMatch Platinum', tier: 'Platinum', savings: Math.round(amount * 0.03), rate: '3% Points', perk: 'Points reward' },
        ],
      };
    }
  }
}

// ==========================================
// V1 MASTER DATA COLLECTION & RAG INTERFACES
// ==========================================

export interface CatalogCreditCard {
  id: number;
  issuer: string;
  card_name: string;
  network: string;
  card_category: string;
  annual_fee: number | null;
  joining_fee: number | null;
  fee_waiver_conditions: string | null;
  forex_markup: string | null;
  eligibility_summary: string | null;
  official_url: string;
  application_url: string | null;
  fuel_surcharge_benefit: string | null;
  lounge_access_summary: string | null;
  upi_enabled: boolean;
  rupay_on_upi_supported: boolean;
  status: string;
  last_verified_at: string;
}

export interface CatalogRewardRule {
  id: number;
  card_id: number;
  transaction_category: string;
  merchant_restrictions: string | null;
  reward_type: string;
  reward_rate: number | null;
  points_per_amount: string | null;
  eligible_transaction_types: string;
  minimum_spend: number | null;
  maximum_reward: number | null;
  reward_cap_period: string;
  redemption_value: number | null;
  redemption_options: string | null;
  redemption_fee: number | null;
  exclusions: string | null;
  effective_from: string | null;
  effective_until: string | null;
  source_document_id: number | null;
  verification_status: string;
}

export interface CatalogCreditCardDetail extends CatalogCreditCard {
  reward_rules: CatalogRewardRule[];
}

export interface CatalogUpiApp {
  id: number;
  app_name: string;
  official_url: string;
  official_help_url: string | null;
  supported_payment_methods: string;
  bank_account_upi_supported: boolean;
  rupay_cc_on_upi_supported: boolean;
  merchant_payment_supported: boolean;
  p2p_supported: boolean;
  published_programs_summary: string | null;
  last_verified_at: string;
}

export interface CatalogOffer {
  id: number;
  offer_name: string;
  issuer: string;
  merchant: string;
  associated_card_id: number | null;
  associated_upi_app_id: number | null;
  offer_type: string;
  reward_rate: number | null;
  fixed_reward_amount: number | null;
  minimum_transaction_amount: number | null;
  maximum_reward_amount: number | null;
  eligible_categories: string | null;
  eligible_user_conditions: string | null;
  excluded_transactions: string | null;
  stacking_rules: string | null;
  effective_from: string;
  effective_until: string;
  source_document_id: number | null;
  verification_status: string;
}

export interface DataQualityReport {
  total_cards_verified: number;
  total_rules_verified: number;
  total_upi_apps_verified: number;
  total_active_offers: number;
  total_expired_offers: number;
  anomalies_detected: number;
  conflicts_count: number;
  requires_review_count: number;
  anomalies: string[];
}

export interface IngestionStatus {
  status: string;
  last_run_at: string | null;
  documents_scanned: number;
  records_updated: number;
  changes_detected: number;
  errors_logged: number;
  summary_message: string;
}

export interface RAGCitation {
  source_title: string;
  publisher: string;
  source_url: string;
  document_type: string;
  effective_dates: string | null;
  passage_snippet: string;
  relevance_score: number;
}

export interface RAGResponse {
  query: string;
  answer: string;
  verified_recommendation: string | null;
  deterministic_rule_match: string | null;
  citations: RAGCitation[];
  confidence_level: string;
}

// ==========================================
// V1 MASTER DATA COLLECTION & RAG ENDPOINTS
// ==========================================

export async function fetchCatalogCards(params?: {
  issuer?: string;
  network?: string;
  category?: string;
  upi_enabled?: boolean;
  search?: string;
}): Promise<CatalogCreditCard[]> {
  try {
    const url = new URL(`${API_BASE_URL}/api/v1/cards`);
    if (params?.issuer) url.searchParams.set('issuer', params.issuer);
    if (params?.network) url.searchParams.set('network', params.network);
    if (params?.category) url.searchParams.set('category', params.category);
    if (params?.upi_enabled !== undefined) url.searchParams.set('upi_enabled', String(params.upi_enabled));
    if (params?.search) url.searchParams.set('search', params.search);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Failed to fetch catalog cards');
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchCatalogCardDetail(cardId: number): Promise<CatalogCreditCardDetail | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/cards/${cardId}`);
    if (!res.ok) throw new Error('Failed to fetch card detail');
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchUpiApps(rupayCcSupported?: boolean): Promise<CatalogUpiApp[]> {
  try {
    const url = new URL(`${API_BASE_URL}/api/v1/upi/apps`);
    if (rupayCcSupported !== undefined) {
      url.searchParams.set('rupay_cc_supported', String(rupayCcSupported));
    }
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Failed to fetch UPI applications');
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchActiveOffers(params?: {
  date?: string;
  merchant?: string;
  category?: string;
}): Promise<CatalogOffer[]> {
  try {
    const url = new URL(`${API_BASE_URL}/api/v1/offers/active`);
    if (params?.date) url.searchParams.set('date', params.date);
    if (params?.merchant) url.searchParams.set('merchant', params.merchant);
    if (params?.category) url.searchParams.set('category', params.category);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error('Failed to fetch active offers');
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchDataQualityReport(): Promise<DataQualityReport | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/data/validate`, {
      method: 'POST',
      headers: { Authorization: 'Bearer demo-token' },
    });
    if (!res.ok) throw new Error('Failed to fetch data quality report');
    return await res.json();
  } catch {
    return null;
  }
}

export async function triggerIngestionRun(): Promise<IngestionStatus | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/ingestion/run`, {
      method: 'POST',
      headers: { Authorization: 'Bearer demo-token' },
    });
    if (!res.ok) throw new Error('Failed to run ingestion');
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchIngestionStatus(): Promise<IngestionStatus | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/admin/ingestion/status`);
    if (!res.ok) throw new Error('Failed to fetch ingestion status');
    return await res.json();
  } catch {
    return null;
  }
}

export async function queryPolicyRAG(query: string, target_date?: string): Promise<RAGResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/rag/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, target_date }),
    });
    if (!res.ok) throw new Error('RAG query failed');
    return await res.json();
  } catch {
    return null;
  }
}

// ----------------------------------------------------
// Enterprise Master Endpoints (Savings, Activity, Reports, Alerts)
// ----------------------------------------------------

export interface SavingsSummaryData {
  total_spend: number;
  total_realized_savings: number;
  buckets: {
    confirmed_instant_discount: number;
    confirmed_cashback: number;
    confirmed_redeemed_reward: number;
    pending_reward: number;
    estimated_reward: number;
    potential_savings: number;
  };
  category_spend: Record<string, number>;
  merchant_spend: Record<string, number>;
  transaction_count: number;
  formula_note: string;
}

export interface CreateTransactionPayload {
  merchant: string;
  category: string;
  amount: number;
  card_used: string;
  payment_method?: string;
  confirmed_discount?: number;
  confirmed_cashback?: number;
  pending_reward?: number;
  estimated_reward?: number;
}

export async function recordSavingsTransaction(
  payload: CreateTransactionPayload,
  userId: number = 1
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/savings/transactions?user_id=${userId}`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to record transaction', err);
    return false;
  }
}

export async function fetchSavingsSummary(userId: number = 1): Promise<SavingsSummaryData | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/savings/summary?user_id=${userId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch savings summary');
    return await res.json();
  } catch {
    return {
      total_spend: 48500,
      total_realized_savings: 5525,
      buckets: {
        confirmed_instant_discount: 2450,
        confirmed_cashback: 1875,
        confirmed_redeemed_reward: 1200,
        pending_reward: 650,
        estimated_reward: 1450,
        potential_savings: 3800,
      },
      category_spend: { Electronics: 18000, Dining: 8500, Shopping: 12000, Travel: 10000 },
      merchant_spend: { 'Amazon India': 14500, Flipkart: 12000, Swiggy: 8500, MakeMyTrip: 10000 },
      transaction_count: 8,
      formula_note: 'Total Realized Savings = Confirmed Instant Discounts + Confirmed Cashback + Confirmed Redeemed Rewards.',
    };
  }
}

export interface ActivityEventItem {
  id: number;
  category: string;
  event_type: string;
  description: string;
  timestamp: string;
  display_timezone: string;
  status: string;
  source: string;
}

export async function fetchActivityEvents(category: string = 'all', userId: number = 1): Promise<ActivityEventItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/activity?category=${category}&user_id=${userId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch activity');
    return await res.json();
  } catch {
    return [
      {
        id: 1,
        category: 'account',
        event_type: 'account_created',
        description: 'Account created with bank-grade encryption in MySQL',
        timestamp: '2026-10-11 12:00:00 UTC',
        display_timezone: 'Asia/Kolkata',
        status: 'confirmed',
        source: 'manual',
      },
      {
        id: 2,
        category: 'card',
        event_type: 'card_added',
        description: 'Linked Tata Neu Infinity HDFC Bank (RuPay on UPI enabled)',
        timestamp: '2026-10-11 12:05:00 UTC',
        display_timezone: 'Asia/Kolkata',
        status: 'confirmed',
        source: 'manual',
      },
      {
        id: 3,
        category: 'transaction',
        event_type: 'purchase_recorded',
        description: 'Recorded purchase of ₹3,499 on Swiggy Instamart (+₹175 cashback)',
        timestamp: '2026-10-11 14:30:00 UTC',
        display_timezone: 'Asia/Kolkata',
        status: 'confirmed',
        source: 'simulated_swipe',
      },
    ];
  }
}

export interface TrackedProductItem {
  id: number;
  title: string;
  brand: string | null;
  category: string;
  merchant_name: string;
  current_price: number;
  original_price: number;
  target_price: number | null;
  best_card_name: string;
  best_discount_rate: string;
  estimated_savings: number;
  image_url: string | null;
  is_in_stock: boolean;
  last_monitored_at: string;
}

export async function fetchTrackedProducts(userId: number = 1): Promise<TrackedProductItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/monitor/products?user_id=${userId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch products');
    return await res.json();
  } catch {
    return [];
  }
}

export async function addTrackedProduct(
  data: {
    title: string;
    merchant_name: string;
    current_price: number;
    target_price?: number;
    category?: string;
  },
  userId: number = 1
): Promise<TrackedProductItem | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/monitor/products?user_id=${userId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add product');
    return await res.json();
  } catch {
    return null;
  }
}

export interface WeeklyReportData {
  id: number;
  report_week: string;
  start_date: string;
  end_date: string;
  total_spend: number;
  total_realized_savings: number;
  confirmed_discounts: number;
  confirmed_cashback: number;
  confirmed_redeemed_rewards: number;
  pending_rewards: number;
  estimated_rewards: number;
  potential_savings: number;
  status: string;
  generated_at: string;
  sections: {
    A_overview?: Record<string, any>;
    B_spending_analysis?: Record<string, any>;
    C_rewards_performance?: Record<string, any>;
    D_shopping_activity?: Record<string, any>;
    E_best_opportunities?: Record<string, any>;
    F_security_activity?: Record<string, any>;
    G_recommendations?: Record<string, any>;
  };
}

export async function fetchWeeklyReport(userId: number = 1): Promise<WeeklyReportData | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/reports/weekly?user_id=${userId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch weekly report');
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateWeeklyReport(userId: number = 1): Promise<WeeklyReportData | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/reports/weekly/generate?user_id=${userId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to generate weekly report');
    return await res.json();
  } catch {
    return null;
  }
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  alert_type: string;
  is_read: boolean;
  created_at: string;
}

export async function fetchNotifications(userId: number = 1): Promise<NotificationItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/notifications?user_id=${userId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return await res.json();
  } catch {
    return [];
  }
}

export async function markNotificationsRead(userId: number = 1): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/notifications/read-all?user_id=${userId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export interface NotificationPreferences {
  email_alerts_enabled: boolean;
  in_app_alerts_enabled: boolean;
  min_price_drop_percent: number;
  weekly_report_day: string;
}

export async function updateNotificationPreferences(
  prefs: NotificationPreferences,
  userId: number = 1
): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/notifications/preferences?user_id=${userId}`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(prefs),
    });
    return res.ok;
  } catch {
    return false;
  }
}

