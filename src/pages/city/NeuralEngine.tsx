import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, Sparkles, MessageSquare, Zap, Lightbulb,
  Music, Users, TrendingUp, Send
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DistrictPortal } from '@/components/ui/DistrictPortal';
import { cn } from '@/lib/utils';

const aiTools = [
  { 
    name: 'Smart Matching', 
    icon: Users, 
    description: 'Find your perfect collaborator',
    color: 'from-cyan-500 to-blue-500',
    status: 'Ready'
  },
  { 
    name: 'Mix Analysis', 
    icon: Music, 
    description: 'AI-powered feedback on your tracks',
    color: 'from-purple-500 to-pink-500',
    status: 'Ready'
  },
  { 
    name: 'Career Insights', 
    icon: TrendingUp, 
    description: 'Data-driven growth strategies',
    color: 'from-green-500 to-emerald-500',
    status: 'Ready'
  },
  { 
    name: 'Creative Spark', 
    icon: Lightbulb, 
    description: 'Beat ideas & inspiration',
    color: 'from-yellow-500 to-orange-500',
    status: 'Beta'
  },
];

const suggestedPrompts = [
  "What's the best way to mix 808s?",
  "Find me an engineer for my EP",
  "Analyze my latest track",
  "How can I grow my fanbase?",
];

export default function NeuralEngine() {
  const [message, setMessage] = useState('');

  return (
    <DistrictPortal districtId="neural">
      <div className="p-6 md:p-8 pb-24">
        {/* Prime AI Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shrink-0">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-bold text-lg">Prime 4.0</h2>
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                    <Zap className="w-3 h-3 mr-1" />
                    Online
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your AI-powered music industry guide. Ask me anything about production, 
                  collaboration, or growing your career.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Chat Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-4 bg-card/50 backdrop-blur border-border/50">
            <div className="min-h-[200px] flex items-center justify-center text-muted-foreground mb-4">
              <div className="text-center">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Start a conversation with Prime</p>
              </div>
            </div>
            
            {/* Suggested Prompts */}
            <div className="flex flex-wrap gap-2 mb-4">
              {suggestedPrompts.map((prompt, index) => (
                <Button 
                  key={index}
                  variant="outline" 
                  size="sm" 
                  className="text-xs"
                  onClick={() => setMessage(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask Prime anything..."
                className="bg-background/50"
              />
              <Button size="icon" className="shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* AI Tools Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Tools
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiTools.map((tool, index) => (
              <motion.div
                key={tool.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                <Card className="p-4 cursor-pointer bg-card/50 backdrop-blur border-border/50 hover:border-primary/50 transition-all group">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shrink-0 group-hover:scale-110 transition-transform",
                      tool.color
                    )}>
                      <tool.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{tool.name}</h4>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            tool.status === 'Beta' && 'border-yellow-500/50 text-yellow-400'
                          )}
                        >
                          {tool.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{tool.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </DistrictPortal>
  );
}
