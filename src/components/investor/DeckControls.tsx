import { useState } from 'react';
import { Maximize, Minimize, ChevronLeft, ChevronRight, Download, Loader2 } from 'lucide-react';
import { exportDeckToPDF } from './exportDeckPDF';

interface Props {
  currentSlide: number;
  totalSlides: number;
  onGoTo: (index: number) => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}

const SLIDE_LABELS = [
  'Title', 'Problem', 'Solution', 'Market', 'Business Model', 'Revenue',
  'Unit Economics', 'Traction', 'Go-to-Market', 'Competition', 'Team', 'The Ask',
];

export function DeckControls({ currentSlide, totalSlides, onGoTo, onToggleFullscreen, isFullscreen }: Props) {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState('');

  const handleExport = async () => {
    setExporting(true);
    setProgress('Preparing...');
    try {
      await exportDeckToPDF((current, total) => {
        setProgress(`Slide ${current}/${total}`);
      });
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setExporting(false);
      setProgress('');
    }
  };

  return (
    <div className="h-16 bg-[hsl(262,30%,3%)] border-t border-border/20 flex items-center px-4 gap-3">
      {/* Prev */}
      <button
        onClick={() => onGoTo(currentSlide - 1)}
        disabled={currentSlide === 0}
        className="p-2 rounded-lg hover:bg-primary/10 disabled:opacity-30 text-foreground transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Thumbnail strip */}
      <div className="flex-1 flex items-center gap-1.5 overflow-x-auto hide-scrollbar px-2">
        {SLIDE_LABELS.map((label, i) => (
          <button
            key={i}
            onClick={() => onGoTo(i)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              i === currentSlide
                ? 'bg-primary/20 text-primary border border-primary/40'
                : 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Counter */}
      <span className="text-sm text-muted-foreground font-mono min-w-[60px] text-center">
        {currentSlide + 1}/{totalSlides}
      </span>

      {/* Next */}
      <button
        onClick={() => onGoTo(currentSlide + 1)}
        disabled={currentSlide === totalSlides - 1}
        className="p-2 rounded-lg hover:bg-primary/10 disabled:opacity-30 text-foreground transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* PDF Export */}
      <button
        onClick={handleExport}
        disabled={exporting}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-primary/10 disabled:opacity-60 text-foreground transition-colors text-xs font-medium"
        title="Export deck as PDF"
      >
        {exporting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-muted-foreground">{progress}</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            PDF
          </>
        )}
      </button>

      {/* Fullscreen */}
      <button
        onClick={onToggleFullscreen}
        className="p-2 rounded-lg hover:bg-primary/10 text-foreground transition-colors"
      >
        {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
      </button>
    </div>
  );
}
