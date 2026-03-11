import { motion } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Disc3, Users, DollarSign, MessageCircle, Sparkles } from "lucide-react";

interface ProducerAssistantIntroProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onOpenChatbot: () => void;
}

export const ProducerAssistantIntro = ({ open, onClose, onNavigate, onOpenChatbot }: ProducerAssistantIntroProps) => {
  const handleFeatureClick = (action: () => void) => {
    onClose();
    setTimeout(action, 100);
  };

  const features = [
    {
      icon: Disc3,
      title: "Upload & Manage Beats",
      description: "Build your catalog — upload beats, set license tiers, and tag by genre and mood",
      action: () => handleFeatureClick(() => onNavigate("catalog")),
    },
    {
      icon: Users,
      title: "Find Artists",
      description: "Get AI-matched with artists who fit your sound and style",
      action: () => handleFeatureClick(() => onNavigate("matches")),
    },
    {
      icon: DollarSign,
      title: "Track Sales & Royalties",
      description: "Monitor beat sales, manage splits, and track your earnings in real-time",
      action: () => handleFeatureClick(() => onNavigate("sales")),
    },
    {
      icon: MessageCircle,
      title: "24/7 Guidance",
      description: "Ask Tempo anything about pricing, licensing, and growing your producer brand",
      action: () => handleFeatureClick(onOpenChatbot),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-amber-500/20">
        <div className="relative bg-gradient-to-br from-background via-background to-amber-500/5">
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{ backgroundColor: "hsl(38 92% 50% / 0.2)" }}
                initial={{
                  x: Math.random() * 100 + "%",
                  y: Math.random() * 100 + "%",
                  scale: 0,
                }}
                animate={{
                  y: [null, Math.random() * 100 + "%"],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
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
                <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(38 92% 50%), hsl(38 92% 50% / 0.5))" }}>
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: "hsl(38 92% 50% / 0.2)" }}
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
                Yo! I'm <span style={{ color: "hsl(38 92% 50%)" }}>Tempo</span>
              </h2>
              <p className="text-muted-foreground text-lg">
                Your AI guide to building, selling, and scaling your beat catalog
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
                  className="flex gap-3 p-4 rounded-lg bg-card border border-border/50 hover:border-amber-500/50 hover:bg-accent/50 transition-all cursor-pointer text-left"
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "hsl(38 92% 50% / 0.1)" }}>
                      <feature.icon className="w-5 h-5" style={{ color: "hsl(38 92% 50%)" }} />
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
                className="w-full md:w-auto bg-amber-600 hover:bg-amber-700 text-white"
              >
                Let's Build
                <Sparkles className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
