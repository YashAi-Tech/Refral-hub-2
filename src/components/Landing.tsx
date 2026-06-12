import { motion } from 'motion/react';
import { LogIn, Users, TrendingUp, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Landing() {
  const { signIn, signInRedirect, isSigningIn, error, clearError } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-200">
            <Zap className="w-8 h-8 text-white fill-white" />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
            Referral<span className="text-blue-600">Hub</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            The simplest way to grow your community. Generate unique links, 
            track performance in real-time, and reward your best referrers.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -top-16 left-0 right-0 bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 flex items-center justify-between gap-2"
            >
              <span>{error}</span>
              <button onClick={clearError} className="p-1 hover:bg-red-100 rounded">×</button>
            </motion.div>
          )}

          <button
            onClick={signIn}
            disabled={isSigningIn}
            className="flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all border border-slate-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
          >
            {isSigningIn ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900"></div>
            ) : (
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
            )}
            {isSigningIn ? 'Connecting...' : 'Get Started with Google'}
          </button>

          <p className="mt-4 text-xs text-slate-400">
            Having trouble? <button onClick={signInRedirect} className="text-blue-500 hover:underline">Try redirect login</button>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-24 max-w-5xl mx-auto">
          <Feature 
            icon={Users} 
            title="Traceable Links" 
            description="Unique referral URLs generated instantly for every user in your network."
          />
          <Feature 
            icon={TrendingUp} 
            title="Live Conversion Tracking" 
            description="Monitor clicks and successful signups as they happen with precision."
          />
          <Feature 
            icon={Zap} 
            title="Instant Rewards" 
            description="Automated system ensures every conversion is logged and rewarded fairly."
          />
        </div>
      </main>

      <footer className="p-8 text-center text-slate-500 text-sm">
        © {new Date().getFullYear()} ReferralHub. Built for viral growth.
      </footer>
    </div>
  );
}

function Feature({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-4 border border-slate-100">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
