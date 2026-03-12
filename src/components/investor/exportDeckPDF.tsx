import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import { TitleSlide } from './slides/TitleSlide';
import { ProblemSlide } from './slides/ProblemSlide';
import { SolutionSlide } from './slides/SolutionSlide';
import { MarketSlide } from './slides/MarketSlide';
import { BusinessModelSlide } from './slides/BusinessModelSlide';
import { RevenueSlide } from './slides/RevenueSlide';
import { UnitEconomicsSlide } from './slides/UnitEconomicsSlide';
import { TractionSlide } from './slides/TractionSlide';
import { GoToMarketSlide } from './slides/GoToMarketSlide';
import { CompetitiveSlide } from './slides/CompetitiveSlide';
import { TeamSlide } from './slides/TeamSlide';
import { AskSlide } from './slides/AskSlide';

const SLIDES = [
  TitleSlide, ProblemSlide, SolutionSlide, MarketSlide,
  BusinessModelSlide, RevenueSlide, UnitEconomicsSlide, TractionSlide,
  GoToMarketSlide, CompetitiveSlide, TeamSlide, AskSlide,
];

/**
 * Renders each slide off-screen at 1920x1080, captures to canvas,
 * and assembles a landscape PDF.
 */
export async function exportDeckToPDF(onProgress?: (current: number, total: number) => void) {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [1920, 1080] });

  // Create off-screen container
  const offscreen = document.createElement('div');
  offscreen.style.cssText = 'position:fixed;left:-9999px;top:0;width:1920px;height:1080px;overflow:hidden;z-index:-1;';
  document.body.appendChild(offscreen);

  try {
    for (let i = 0; i < SLIDES.length; i++) {
      onProgress?.(i + 1, SLIDES.length);

      // Mount slide
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'width:1920px;height:1080px;background:hsl(262,30%,4%);';
      offscreen.appendChild(wrapper);

      const SlideComponent = SLIDES[i];
      const root = createRoot(wrapper);
      root.render(<SlideComponent />);

      // Wait for render + charts to paint
      await new Promise(r => setTimeout(r, 600));

      // Capture
      const canvas = await html2canvas(wrapper, {
        width: 1920,
        height: 1080,
        scale: 1,
        useCORS: true,
        backgroundColor: '#0a0812',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.92);

      if (i > 0) pdf.addPage([1920, 1080], 'landscape');
      pdf.addImage(imgData, 'JPEG', 0, 0, 1920, 1080);

      // Cleanup
      root.unmount();
      offscreen.removeChild(wrapper);
    }

    pdf.save('MixxClub-Investor-Deck.pdf');
  } finally {
    document.body.removeChild(offscreen);
  }
}
