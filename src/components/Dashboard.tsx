import { motion } from 'motion/react';
import { Share2, MousePointer2, UserPlus, Gift, Copy, Check, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { ReferralRecord } from '../types';

export function Dashboard() {
  const { profile, logout } = useAuth();
  const [copied, setCopied] = useState(false);
  const [recentReferrals, setRecentReferrals] = useState<ReferralRecord[]>([]);

  useEffect(() => {
    if (!profile) return;

    const q = query(
      collection(db, 'referrals'),
      where('referrerUid', '==', profile.uid),
      orderBy('timestamp', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const referrals = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ReferralRecord[];
      setRecentReferrals(referrals);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'referrals');
    });

    return () => unsubscribe();
  }, [profile]);

  if (!profile) return null;

  const referralLink = `${window.location.origin}/r/${profile.referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = [
    { label: 'Total Clicks', value: profile.clicks, icon: MousePointer2, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Successful Referrals', value: profile.conversions, icon: UserPlus, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Rewards Earned', value: `$${profile.rewards.toFixed(2)}`, icon: Gift, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Referral Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your performance and manage your links.</p>
        </div>
        <button 
          onClick={logout}
          className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
        >
          Sign Out
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl border bg-white shadow-sm"
          >
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-8 rounded-3xl border bg-slate-900 text-white overflow-hidden relative"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Share2 className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold">Your Referral Link</h2>
          </div>
          <p className="text-slate-400 mb-6 max-w-lg">
            Share this link with your friends. You'll earn rewards when they sign up and start using our platform!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 bg-slate-800 rounded-xl px-4 py-3 font-mono text-sm border border-slate-700 truncate">
              {referralLink}
            </div>
            <button
              onClick={copyToClipboard}
              className={cn(
                "px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 whitespace-nowrap",
                copied ? "bg-green-500 text-white" : "bg-blue-600 hover:bg-blue-500 text-white"
              )}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Link
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] -mr-32 -mt-32 rounded-full" />
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-12"
      >
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-slate-400" />
          <h2 className="text-xl font-bold">Recent Referrals</h2>
        </div>

        {recentReferrals.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed text-center text-muted-foreground bg-slate-50/50">
            No referrals yet. Start sharing to see your progress here!
          </div>
        ) : (
          <div className="divide-y border rounded-2xl bg-white overflow-hidden shadow-sm">
            {recentReferrals.map((referral) => (
              <div key={referral.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">New User Signup</p>
                    <p className="text-sm text-slate-500">
                      {new Date(referral.timestamp).toLocaleDateString()} at {new Date(referral.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-600 font-bold">+$5.00</p>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Reward Added</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
