import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { AICopilotSidebar } from "./AICopilotSidebar";

interface ResizableAICopilotProps {
  children: React.ReactNode;
  insights: Array<{
    type: string;
    title: string;
    description: string;
  }>;
  isLoading: boolean;
}

const STORAGE_KEY = "mixclub-copilot-panel-size";
const DEFAULT_SIZE = 25; // 25% of screen width
const MIN_SIZE = 20; // ~280px on 1280px screen
const MAX_SIZE = 45; // ~600px on 1280px screen

export function ResizableAICopilot({ children, insights, isLoading }: ResizableAICopilotProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [panelSize, setPanelSize] = useState<number>(DEFAULT_SIZE);

  // Load saved panel size from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const size = parseFloat(saved);
      if (size >= MIN_SIZE && size <= MAX_SIZE) {
        setPanelSize(size);
      }
    }
  }, []);

  // Save panel size to localStorage
  const handlePanelResize = (sizes: number[]) => {
    const copilotSize = sizes[1];
    if (copilotSize >= MIN_SIZE && copilotSize <= MAX_SIZE) {
      setPanelSize(copilotSize);
      localStorage.setItem(STORAGE_KEY, copilotSize.toString());
    }
  };

  if (!isOpen) {
    return (
      <div className="relative w-full">
        {children}
        
        <AnimatePresence>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <Button
              size="lg"
              onClick={() => setIsOpen(true)}
              className="gap-2 shadow-lg bg-primary hover:bg-primary/90"
            >
              <Bot className="h-5 w-5" />
              <span>Open AI Copilot</span>
            </Button>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-full w-full"
      onLayout={handlePanelResize}
    >
      {/* Main Dashboard Content */}
      <ResizablePanel defaultSize={100 - panelSize} minSize={50}>
        {children}
      </ResizablePanel>

      {/* Resize Handle */}
      <ResizableHandle 
        withHandle 
        className="w-1 bg-border hover:bg-primary/20 transition-colors"
      />

      {/* AI Copilot Panel */}
      <ResizablePanel 
        defaultSize={panelSize}
        minSize={MIN_SIZE}
        maxSize={MAX_SIZE}
        className="bg-background/50 backdrop-blur-xl border-l"
      >
        <AICopilotSidebar 
          insights={insights} 
          isLoading={isLoading}
          onClose={() => setIsOpen(false)}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
