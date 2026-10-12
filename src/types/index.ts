export interface CreditCard {
  id: string;
  name: string;
  tier: 'Platinum' | 'Gold' | 'Cashback';
  cardNumberMasked: string;
  cardHolder: string;
  expiry: string;
  network: 'VISA' | 'Mastercard' | 'RuPay';
  accentColor: string;
  secondaryColor: string;
  gradient: string;
  creditLimit: number;
  availableLimit: number;
  rewardPoints: number;
  cashbackEarned: number;
  annualFee: number;
  highlightBenefit: string;
  categories: {
    name: string;
    rate: string;
    icon: string;
  }[];
}

export interface RewardItem {
  id: string;
  type: 'voucher' | 'discount' | 'points' | 'travel';
  title: string;
  value: string;
  code: string;
  expiry: string;
  description: string;
  terms: string;
  iconName: 'gift' | 'percent' | 'indian-rupee' | 'plane';
  category: string;
  isRevealed: boolean;
  claimed: boolean;
  colorScheme: {
    bg: string;
    border: string;
    accent: string;
    badge: string;
  };
}

export interface Product {
  id: string;
  title: string;
  brand: string;
  category: 'Electronics' | 'Audio' | 'Footwear' | 'Wearables' | 'Home' | 'Luggage';
  originalPrice: number;
  discountPrice: number;
  bestCardId: string;
  bestCardName: string;
  savingsAmount: number;
  cashbackPercent: number;
  rating: number;
  reviewsCount: number;
  image: string;
  tags: string[];
}

export interface TransactionActivity {
  id: string;
  merchant: string;
  category: string;
  date: string;
  amount: number;
  cashbackEarned: number;
  cardUsed: string;
  status: 'Completed' | 'Pending';
}

export interface SpendingCategory {
  id: string;
  name: string;
  monthlySpend: number;
  currentSavings: number;
  optimizedSavings: number;
  recommendedCard: string;
}
