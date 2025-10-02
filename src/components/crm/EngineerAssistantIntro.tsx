import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, DollarSign, Wrench, Award, MessageCircle } from "lucide-react";

interface EngineerAssistantIntroProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onOpenChatbot: () => void;
}

export const EngineerAssistantIntro = ({ open, onClose, onNavigate, onOpenChatbot }: EngineerAssistantIntroProps) => {
  const features = [
    {
      icon: DollarSign,
      title: "Maximize Your Revenue",
      description: "I'll help you optimize your 70% revenue share and grow your income",
      action: () => onNavigate('business')
    },
    {
      icon: Wrench,
      title: "Technical Guidance",
      description: "Get expert tips for mixing, mastering, and using our professional tools",
      action: () => onNavigate('studio')
    },
    {
      icon: TrendingUp,
      title: "Build Your Reputation",
      description: "Grow your client base and establish yourself as a top engineer",
      action: () => onNavigate('opportunities')
    },
    {
      icon: Award,
      title: "Manage Your Business",
      description: "Track earnings, handle payouts, and streamline your workflow",
      action: () => {
        onClose();
        onOpenChatbot();
      }
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-primary/20">
        <div className="relative bg-gradient-to-br from-background via-background to-primary/5">
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-primary/20 rounded-full"
                initial={{ 
                  x: Math.random() * 100 + "%", 
                  y: Math.random() * 100 + "%",
                  scale: 0 
                }}
                animate={{ 
                  y: [null, Math.random() * 100 + "%"],
                  scale: [0, 1, 0]
                }}
                transition={{ 
                  duration: 3 + Math.random() * 2, 
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
              />
            ))}
          </div>

          <div className="relative p-8">
            {/* Header with animated logo */}
            <div className="flex items-center justify-center mb-6">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.8 }}
                className="relative"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-primary-foreground" />
                </div>
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary/20"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            </div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-6"
            >
              <h2 className="text-3xl font-bold mb-2">
                Welcome! I'm Your <span className="text-primary">AI Assistant</span>
              </h2>
              <p className="text-muted-foreground text-lg">
                I'm here to help you succeed and grow your engineering business
              </p>
            </motion.div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  onClick={feature.action}
                  className="flex gap-3 p-4 rounded-lg bg-card border border-border/50 hover:border-primary/50 hover:bg-accent/50 transition-all cursor-pointer text-left"
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="text-center space-y-4"
            >
              <p className="text-sm text-muted-foreground">
                You can chat with me anytime using the assistant button in the bottom right corner
              </p>
              <Button 
                onClick={onClose}
                size="lg"
                className="w-full md:w-auto"
              >
                Let's Get Started
                <Sparkles className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
