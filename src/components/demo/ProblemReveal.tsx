 import { motion } from 'framer-motion';
 import { HardDrive, DollarSign, TrendingDown, Clock } from 'lucide-react';
 
 interface ProblemRevealProps {
   amplitude: number;
   bass: number;
   isPlaying: boolean;
 }
 
 const problems = [
   {
     icon: HardDrive,
     stat: "87%",
     label: "of tracks never released",
   },
   {
     icon: DollarSign,
     stat: "$1,500",
     label: "average mixing cost",
   },
   {
     icon: TrendingDown,
     stat: "73%",
     label: "fail streaming quality",
   },
   {
     icon: Clock,
     stat: "3-6 weeks",
     label: "to find an engineer",
   },
 ];
 
 export const ProblemReveal = ({ amplitude, bass, isPlaying }: ProblemRevealProps) => {
   return (
     <motion.div
       className="w-full max-w-5xl mx-auto text-center px-4"
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       exit={{ opacity: 0, scale: 0.95 }}
     >
       {/* Main Statistic - Cinematic Reveal */}
       <motion.div
         className="mb-12"
         initial={{ opacity: 0, y: 30 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.8 }}
       >
         <motion.div
           className="inline-flex items-center gap-4 mb-6"
           animate={{
             scale: isPlaying ? [1, 1.02, 1] : 1,
           }}
           transition={{ duration: 2, repeat: Infinity }}
         >
           <motion.div
             className="w-16 h-16 rounded-2xl bg-destructive/20 border border-destructive/40 flex items-center justify-center"
             animate={{
               boxShadow: isPlaying
                 ? `0 0 ${20 + (bass / 255) * 30}px rgba(239, 68, 68, 0.4)`
                 : 'none',
             }}
           >
             <HardDrive className="w-8 h-8 text-destructive" />
           </motion.div>
         </motion.div>
 
         <motion.h1
           className="text-5xl md:text-7xl lg:text-8xl font-black mb-6"
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.3, duration: 0.6 }}
         >
           <span className="text-destructive">87%</span>{' '}
           <span className="text-foreground/80">of tracks</span>
         </motion.h1>
 
         <motion.p
           className="text-2xl md:text-3xl lg:text-4xl font-bold text-muted-foreground"
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.6 }}
         >
           never leave the hard drive.
         </motion.p>
       </motion.div>
 
       {/* Subtext */}
       <motion.p
         className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12"
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ delay: 1 }}
       >
         Not because they're bad.{' '}
         <span className="text-destructive font-semibold">
           Because pro mixing costs $1,500 a song.
         </span>
       </motion.p>
 
       {/* Problem Stats Grid */}
       <motion.div
         className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 1.3 }}
       >
         {problems.map((problem, index) => {
           const Icon = problem.icon;
           return (
             <motion.div
               key={index}
               className="p-4 rounded-xl bg-destructive/5 border border-destructive/20"
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 1.5 + index * 0.1 }}
               whileHover={{ scale: 1.02 }}
             >
               <Icon className="w-5 h-5 text-destructive/70 mx-auto mb-2" />
               <div className="text-xl font-bold text-destructive">{problem.stat}</div>
               <div className="text-xs text-muted-foreground">{problem.label}</div>
             </motion.div>
           );
         })}
       </motion.div>
 
       {/* Pulsing indicator */}
       <motion.div
         className="mt-12 flex justify-center"
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ delay: 2 }}
       >
         <motion.div
           className="flex items-center gap-2 text-muted-foreground/60"
           animate={{ opacity: [0.4, 1, 0.4] }}
           transition={{ duration: 2, repeat: Infinity }}
         >
           <span className="text-sm">There has to be a better way...</span>
         </motion.div>
       </motion.div>
     </motion.div>
   );
 };