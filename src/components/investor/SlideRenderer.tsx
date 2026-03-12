import { motion, AnimatePresence } from 'framer-motion';
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
  direction: number;
}

const variants = {
  enter: (dir: number) => ({
    x: dir * 60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir * -60,
    opacity: 0,
  }),
};

export function SlideRenderer({ slideIndex, direction }: Props) {
  const SlideComponent = SLIDES[slideIndex] || TitleSlide;
  return (
    <div className="w-[1920px] h-[1080px] bg-[hsl(262,30%,4%)] overflow-hidden relative">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={slideIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full h-full"
        >
          <SlideComponent />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
