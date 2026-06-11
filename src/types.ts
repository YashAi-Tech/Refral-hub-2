export interface UserProfile {
  uid: string;
  email: string;
  referralCode: string;
  clicks: number;
  conversions: number;
  rewards: number;
  createdAt: string;
}

export interface ReferralRecord {
  id: string;
  referrerUid: string;
  referredUid: string;
  timestamp: string;
}

export interface ClickRecord {
  id: string;
  referrerUid: string;
  timestamp: string;
  userAgent: string;
}
