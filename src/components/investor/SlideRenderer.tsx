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
  TitleSlide,
  ProblemSlide,
  SolutionSlide,
  MarketSlide,
  BusinessModelSlide,
  RevenueSlide,
  UnitEconomicsSlide,
  TractionSlide,
  GoToMarketSlide,
  CompetitiveSlide,
  TeamSlide,
  AskSlide,
];

interface Props {
  slideIndex: number;
}

export function SlideRenderer({ slideIndex }: Props) {
  const SlideComponent = SLIDES[slideIndex] || TitleSlide;
  return (
    <div className="w-[1920px] h-[1080px] bg-[hsl(262,30%,4%)] overflow-hidden relative">
      <SlideComponent />
    </div>
  );
}
