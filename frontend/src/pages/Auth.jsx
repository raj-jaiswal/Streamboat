import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, User, KeyRound, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import streamboatIcon from '../assets/streamboat.svg';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const isSignUp = location.pathname === '/signup';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate login
    navigate('/library');
  };

  return (
    <div className="min-h-screen bg-sb-bg flex text-sb-text">
      {/* Left side: Visuals */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-end p-20 overflow-hidden border-r border-sb-border">
        {/* Abstract wavy lines background placeholder */}
        <div className="absolute inset-0 opacity-20">
          <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#00e5ff', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#9d4edd', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            <path d="M0,200 C200,100 400,300 600,200 C800,100 1000,300 1200,200 L1200,1000 L0,1000 Z" fill="url(#grad1)" opacity="0.1" />
            <path d="M0,400 C300,200 500,500 800,400 C1100,300 1300,600 1600,500 L1600,1000 L0,1000 Z" fill="url(#grad1)" opacity="0.1" />
          </svg>
        </div>
        
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-2 mb-6 text-sb-primary font-bold text-xs uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            The Cinematic Sentinel
          </div>
          <h1 className="text-6xl font-extrabold tracking-tighter leading-tight mb-4">
            Uncompromised<br/>
            <span className="gradient-primary text-gradient">Quality.</span>
          </h1>
          <p className="text-lg text-sb-text-muted leading-relaxed">
            Enter the secure vault. Experience premium streaming backed by enterprise-grade anti-piracy architecture.
          </p>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <img src={streamboatIcon} alt="Logo" className="w-8 h-8" />
            <span className="font-bold text-2xl tracking-tight">Streamboat</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-3xl font-extrabold mb-2 tracking-tight">
              {isSignUp ? 'Request Clearance' : 'Secure Vault Access'}
            </h2>
            <p className="text-sm text-sb-text-muted mb-8">
              {isSignUp ? 'Initialize a new dossier to access the secure network.' : 'Authenticate identity to continue to your dashboard.'}
            </p>

            <div className="flex gap-4 mb-8">
              <button className="flex-1 bg-sb-surface hover:bg-sb-surface-hover border border-sb-border rounded-lg py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google
              </button>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-sb-border"></div>
              <span className="text-[10px] uppercase tracking-widest text-sb-text-muted font-bold">System Override / Manual Entry</span>
              <div className="flex-1 h-px bg-sb-border"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-sb-text-muted font-bold mb-2">
                  Operative Identifier
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sb-text-muted" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="email@streamboat.io"
                    className="w-full bg-sb-surface border border-sb-border rounded-lg py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-sb-primary transition-colors text-sb-text placeholder:text-sb-text-muted"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="block text-[10px] uppercase tracking-widest text-sb-text-muted font-bold">
                    Access Key
                  </label>
                  {!isSignUp && (
                    <a href="#" className="text-[10px] font-bold text-sb-primary hover:underline">
                      Forgot Key?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sb-text-muted" />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-sb-surface border border-sb-border rounded-lg py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-sb-primary transition-colors text-sb-text placeholder:text-sb-text-muted"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-sb-primary to-[#00f2fe] text-black font-bold py-3.5 rounded-full flex items-center justify-center gap-2 hover:opacity-90 transition-opacity mt-4"
              >
                {isSignUp ? 'Establish Connection' : 'Initialize Session'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-sb-text-muted">
              {isSignUp ? (
                <>Active dossier found? <Link to="/login" className="text-sb-purple font-bold hover:underline">Initialize Session</Link></>
              ) : (
                <>No active dossier? <Link to="/signup" className="text-sb-purple font-bold hover:underline">Request Clearance</Link></>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
