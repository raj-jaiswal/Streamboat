import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import streamboatIcon from '../assets/streamboat.svg';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-sb-bg text-sb-text flex flex-col relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-sb-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sb-purple/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Navbar for Landing */}
      <nav className="h-24 px-8 md:px-16 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <img src={streamboatIcon} alt="Logo" className="w-8 h-8" />
          <span className="font-bold text-2xl tracking-tight">Streamboat</span>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/login')}
            className="text-sm font-semibold hover:text-sb-primary transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={() => navigate('/signup')}
            className="bg-sb-surface border border-sb-border hover:border-sb-primary px-6 py-2.5 rounded-full text-sm font-bold transition-all hover:shadow-[0_0_20px_rgba(0,229,255,0.2)]"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex items-center px-8 md:px-16 lg:px-24 z-10">
        <div className="max-w-3xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 mb-6"
          >
            <div className="w-2 h-2 rounded-full bg-sb-primary animate-pulse" />
            <span className="text-xs font-bold tracking-widest text-sb-primary uppercase">Encrypted Transmission</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl md:text-8xl font-extrabold tracking-tighter leading-[1.1] mb-6"
          >
            Uncompromised<br/>
            Content.<br/>
            <span className="gradient-primary text-gradient">Absolute Security.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-sb-text-muted max-w-2xl mb-12 leading-relaxed"
          >
            Experience cinematic quality streaming within a fortified digital vault. 
            Anti-piracy architecture meets editorial design. Your premier destination for exclusive media.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <button 
              onClick={() => navigate('/signup')}
              className="w-full sm:w-auto bg-gradient-to-r from-sb-primary to-[#00f2fe] text-black px-8 py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-[0_0_30px_rgba(0,229,255,0.3)] hover:scale-105 transform duration-200"
            >
              <Play className="w-5 h-5 fill-black" />
              Get Started
            </button>
            <button className="w-full sm:w-auto px-8 py-4 rounded-full font-bold border border-sb-border hover:bg-sb-surface transition-colors flex items-center justify-center">
              View Technical Specs
            </button>
          </motion.div>
        </div>
      </main>
      
      {/* Footer / Info */}
      <footer className="h-20 border-t border-sb-border/50 flex items-center justify-between px-8 md:px-16 text-xs text-sb-text-muted z-10">
        <div className="flex items-center gap-4">
          <img src={streamboatIcon} alt="Logo" className="w-4 h-4 opacity-50" />
          <span>© 2024 STREAMBOAT CINEMATIC SENTINEL. ALL RIGHTS RESERVED.</span>
        </div>
        <div className="flex gap-6 hidden md:flex">
          <a href="#" className="hover:text-sb-text transition-colors uppercase tracking-wider">Privacy Policy</a>
          <a href="#" className="hover:text-sb-text transition-colors uppercase tracking-wider">Terms of Service</a>
          <a href="#" className="hover:text-sb-text transition-colors uppercase tracking-wider">Copyright DMCA</a>
        </div>
      </footer>
    </div>
  );
}
