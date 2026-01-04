import { motion } from "framer-motion";
import { Video, Mic, MicOff, Monitor, MessageSquare, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

const participants = [
  { name: "Marcus J.", role: "Artist", location: "Brooklyn", initials: "MJ", speaking: true },
  { name: "Sarah K.", role: "Engineer", location: "Atlanta", initials: "SK", speaking: false },
  { name: "Devon R.", role: "Producer", location: "Lagos", initials: "DR", speaking: false },
];

const chatMessages = [
  { from: "Marcus J.", text: "Can we add more 808 in the verse?" },
  { from: "Sarah K.", text: "On it, check this..." },
  { from: "Devon R.", text: "🔥 That hit different" },
  { from: "Sarah K.", text: "Boosted the low end by 3dB" },
  { from: "Marcus J.", text: "Perfect, exactly what I needed" },
];

export function SessionPreview() {
  const [activeSpeaker, setActiveSpeaker] = useState(0);
  const [visibleMessages, setVisibleMessages] = useState<number>(0);
  const [levels, setLevels] = useState([0.7, 0.3, 0.2]);

  // Simulate speaker changes
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSpeaker((prev) => (prev + 1) % participants.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Simulate audio levels
  useEffect(() => {
    const interval = setInterval(() => {
      setLevels([
        0.3 + Math.random() * 0.7,
        0.2 + Math.random() * 0.5,
        0.1 + Math.random() * 0.4,
      ]);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // Simulate chat messages appearing
  useEffect(() => {
    if (visibleMessages < chatMessages.length) {
      const timeout = setTimeout(() => {
        setVisibleMessages((prev) => prev + 1);
      }, 2000);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setVisibleMessages(0);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [visibleMessages]);

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      
      <div className="container px-6 relative z-10">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Video className="w-3 h-3 mr-1" />
            Live Collaboration
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            This is What{" "}
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Collaboration
            </span>{" "}
            Looks Like
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Work with artists and engineers anywhere in the world. Video, audio, chat - all in real-time.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <Card className="p-6 glass-mid border-border/50 overflow-hidden">
            {/* Session Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="font-semibold">Recording Session</span>
                <Badge variant="outline" className="text-xs">
                  02:34:17
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>3 participants</span>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Video Grid */}
              <div className="lg:col-span-2 grid grid-cols-3 gap-3">
                {participants.map((participant, index) => (
                  <motion.div
                    key={participant.name}
                    className={`relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-muted to-muted/50 ${
                      activeSpeaker === index ? "ring-2 ring-primary" : ""
                    }`}
                    animate={{
                      scale: activeSpeaker === index ? 1.02 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Avatar className="w-16 h-16">
                        <AvatarFallback className="bg-primary/20 text-primary text-xl">
                          {participant.initials}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    {/* Name & Location */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium bg-black/60 px-2 py-0.5 rounded">
                          {participant.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {participant.location}
                        </span>
                      </div>
                      {activeSpeaker === index ? (
                        <Mic className="w-3 h-3 text-primary" />
                      ) : (
                        <MicOff className="w-3 h-3 text-muted-foreground" />
                      )}
                    </div>

                    {/* Level Meter */}
                    <div className="absolute top-2 right-2 w-1 h-8 bg-muted/50 rounded-full overflow-hidden">
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 bg-primary rounded-full"
                        animate={{ height: `${levels[index] * 100}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>

                    {/* Speaking Indicator */}
                    {activeSpeaker === index && (
                      <motion.div
                        className="absolute inset-0 border-2 border-primary rounded-xl"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Chat Panel */}
              <div className="bg-muted/30 rounded-xl p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/50">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Session Chat</span>
                </div>
                
                <div className="flex-1 space-y-2 overflow-hidden">
                  {chatMessages.slice(0, visibleMessages).map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm"
                    >
                      <span className="font-medium text-primary">{msg.from}:</span>{" "}
                      <span className="text-muted-foreground">{msg.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50">
                <Mic className="w-4 h-4 text-primary" />
                <Video className="w-4 h-4 text-primary" />
                <Monitor className="w-4 h-4 text-muted-foreground" />
              </div>
              <Badge className="bg-primary/20 text-primary border-primary/30">
                Brooklyn · Atlanta · Lagos
              </Badge>
            </div>
          </Card>
        </div>

        <p className="text-center mt-8 text-lg text-muted-foreground">
          <span className="text-primary font-semibold">Real engineers.</span>{" "}
          <span className="text-secondary font-semibold">Real artists.</span>{" "}
          <span className="text-accent font-semibold">One session.</span>
        </p>
      </div>
    </section>
  );
}
