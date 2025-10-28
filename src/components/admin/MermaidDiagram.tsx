import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
  className?: string;
}

export const MermaidDiagram = ({ chart, className = '' }: MermaidDiagramProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!ref.current) return;

      try {
        // Initialize with strict security level to prevent XSS
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'strict', // ✅ Prevent arbitrary HTML/JS execution
          fontFamily: 'monospace',
        });

        // Use Mermaid's safe render method instead of direct innerHTML
        const id = `diagram-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        
        // Set the sanitized SVG output
        ref.current.innerHTML = svg;
      } catch (error) {
        console.error('Failed to render Mermaid diagram:', error);
        ref.current.innerHTML = '<p class="text-destructive">Failed to render diagram</p>';
      }
    };

    renderDiagram();
  }, [chart]);

  return <div ref={ref} className={`mermaid ${className}`} />;
};
