import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Mail, Music, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AuthMorphOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Pass email to auth page via query param or state if needed
      navigate(`/auth?email=${encodeURIComponent(email)}&mode=signup`);
    } else {
      setIsOpen(true);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative z-50">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="cta"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-6"
          >
            <h3 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
              Ready to Ascend?
            </h3>
            <p className="text-white/60 text-center max-w-sm">
              Join the elite network of producers and engineers shaping the future of sound.
            </p>
            
            <motion.button
              onClick={() => setIsOpen(true)}
              className="group relative px-8 py-4 bg-primary rounded-full text-black font-bold text-lg overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Initialize Profile <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, scale: 0.95, height: 100 }}
            animate={{ opacity: 1, scale: 1, height: 'auto' }}
            className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl w-full"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white">Create Identity</h4>
                <p className="text-xs text-white/50">Secure Automated Access</p>
              </div>
            </div>

            <form onSubmit={handleJoin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-mono text-white/60 uppercase">Transmission Gateway</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input 
                    type="email" 
                    placeholder="enter@email.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/5 border-white/10 pl-10 text-white placeholder:text-white/20 focus:border-primary/50"
                    autoFocus
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 bg-primary text-black font-bold hover:bg-primary/90">
                Begin Sequence
              </Button>

              <div className="text-center">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-white/30 hover:text-white transition-colors"
                >
                  Cancel Transmission
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
