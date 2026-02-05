 import { useState, useRef, useEffect } from 'react';
 import { Button } from '@/components/ui/button';
 import { Slider } from '@/components/ui/slider';
 import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
 
 interface BeatAudioPlayerProps {
   audioUrl: string;
   title: string;
   className?: string;
   compact?: boolean;
 }
 
 export function BeatAudioPlayer({ audioUrl, title, className = '', compact = false }: BeatAudioPlayerProps) {
   const audioRef = useRef<HTMLAudioElement>(null);
   const [isPlaying, setIsPlaying] = useState(false);
   const [currentTime, setCurrentTime] = useState(0);
   const [duration, setDuration] = useState(0);
   const [volume, setVolume] = useState(0.8);
   const [isMuted, setIsMuted] = useState(false);
 
   useEffect(() => {
     const audio = audioRef.current;
     if (!audio) return;
 
     const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
     const handleLoadedMetadata = () => setDuration(audio.duration);
     const handleEnded = () => setIsPlaying(false);
 
     audio.addEventListener('timeupdate', handleTimeUpdate);
     audio.addEventListener('loadedmetadata', handleLoadedMetadata);
     audio.addEventListener('ended', handleEnded);
 
     return () => {
       audio.removeEventListener('timeupdate', handleTimeUpdate);
       audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
       audio.removeEventListener('ended', handleEnded);
     };
   }, []);
 
   const togglePlay = () => {
     if (!audioRef.current) return;
 
     if (isPlaying) {
       audioRef.current.pause();
     } else {
       audioRef.current.play();
     }
     setIsPlaying(!isPlaying);
   };
 
   const handleSeek = (value: number[]) => {
     if (!audioRef.current) return;
     audioRef.current.currentTime = value[0];
     setCurrentTime(value[0]);
   };
 
   const handleVolumeChange = (value: number[]) => {
     if (!audioRef.current) return;
     const newVolume = value[0];
     audioRef.current.volume = newVolume;
     setVolume(newVolume);
     setIsMuted(newVolume === 0);
   };
 
   const toggleMute = () => {
     if (!audioRef.current) return;
     const newMuted = !isMuted;
     audioRef.current.volume = newMuted ? 0 : volume;
     setIsMuted(newMuted);
   };
 
   const formatTime = (time: number) => {
     const minutes = Math.floor(time / 60);
     const seconds = Math.floor(time % 60);
     return `${minutes}:${seconds.toString().padStart(2, '0')}`;
   };
 
   if (compact) {
     return (
       <div className={`flex items-center gap-2 ${className}`}>
         <audio ref={audioRef} src={audioUrl} preload="metadata" />
         <Button
           variant="ghost"
           size="icon"
           className="h-8 w-8"
           onClick={togglePlay}
         >
           {isPlaying ? (
             <Pause className="h-4 w-4" />
           ) : (
             <Play className="h-4 w-4" />
           )}
         </Button>
         <div className="flex-1 min-w-0">
           <Slider
             value={[currentTime]}
             max={duration || 100}
             step={0.1}
             onValueChange={handleSeek}
             className="w-full"
           />
         </div>
         <span className="text-xs text-muted-foreground min-w-[35px]">
           {formatTime(currentTime)}
         </span>
       </div>
     );
   }
 
   return (
     <div className={`space-y-3 ${className}`}>
       <audio ref={audioRef} src={audioUrl} preload="metadata" />
       
       <div className="flex items-center gap-3">
         <Button
           variant="secondary"
           size="icon"
           className="h-12 w-12"
           onClick={togglePlay}
         >
           {isPlaying ? (
             <Pause className="h-6 w-6" />
           ) : (
             <Play className="h-6 w-6" />
           )}
         </Button>
 
         <div className="flex-1 space-y-1">
           <div className="flex justify-between text-xs text-muted-foreground">
             <span>{formatTime(currentTime)}</span>
             <span>{formatTime(duration)}</span>
           </div>
           <Slider
             value={[currentTime]}
             max={duration || 100}
             step={0.1}
             onValueChange={handleSeek}
             className="w-full"
           />
         </div>
 
         <div className="flex items-center gap-2 min-w-[100px]">
           <Button
             variant="ghost"
             size="icon"
             className="h-8 w-8"
             onClick={toggleMute}
           >
             {isMuted ? (
               <VolumeX className="h-4 w-4" />
             ) : (
               <Volume2 className="h-4 w-4" />
             )}
           </Button>
           <Slider
             value={[isMuted ? 0 : volume]}
             max={1}
             step={0.01}
             onValueChange={handleVolumeChange}
             className="w-16"
           />
         </div>
       </div>
     </div>
   );
 }