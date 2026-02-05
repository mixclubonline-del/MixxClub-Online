 import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
 import { Label } from '@/components/ui/label';
 import { Badge } from '@/components/ui/badge';
 import { Check, Crown, Music } from 'lucide-react';
 
 interface LicenseSelectorProps {
   licenseType: 'lease' | 'exclusive' | 'both';
   leasePriceCents: number;
   exclusivePriceCents: number;
   isExclusiveAvailable: boolean;
   selectedLicense: 'lease' | 'exclusive';
   onSelect: (license: 'lease' | 'exclusive') => void;
 }
 
 const LICENSE_TERMS = {
   lease: {
     title: 'Lease License',
     icon: Music,
     features: [
       'Non-exclusive rights',
       'Up to 500,000 streams',
       'Must credit producer',
       'MP3 + WAV files',
       'Commercial use allowed',
     ],
   },
   exclusive: {
     title: 'Exclusive License',
     icon: Crown,
     features: [
       'Full ownership transfer',
       'Unlimited streams',
       'No credit required',
       'All audio stems included',
       'Remove from marketplace',
     ],
   },
 };
 
 export function LicenseSelector({
   licenseType,
   leasePriceCents,
   exclusivePriceCents,
   isExclusiveAvailable,
   selectedLicense,
   onSelect,
 }: LicenseSelectorProps) {
   const showLease = licenseType === 'lease' || licenseType === 'both';
   const showExclusive = licenseType === 'exclusive' || licenseType === 'both';
 
   const formatPrice = (cents: number) => {
     return (cents / 100).toLocaleString('en-US', {
       style: 'currency',
       currency: 'USD',
     });
   };
 
   return (
     <RadioGroup
       value={selectedLicense}
       onValueChange={(value) => onSelect(value as 'lease' | 'exclusive')}
       className="space-y-3"
     >
       {showLease && (
         <div
           className={`relative rounded-lg border-2 p-4 cursor-pointer transition-colors ${
             selectedLicense === 'lease'
               ? 'border-primary bg-primary/5'
               : 'border-muted hover:border-muted-foreground/50'
           }`}
           onClick={() => onSelect('lease')}
         >
           <div className="flex items-start gap-3">
             <RadioGroupItem value="lease" id="lease" className="mt-1" />
             <div className="flex-1">
               <div className="flex items-center justify-between mb-2">
                 <Label htmlFor="lease" className="text-base font-semibold cursor-pointer">
                   <Music className="h-4 w-4 inline mr-2" />
                   {LICENSE_TERMS.lease.title}
                 </Label>
                 <span className="text-xl font-bold text-primary">
                   {formatPrice(leasePriceCents)}
                 </span>
               </div>
               <ul className="space-y-1">
                 {LICENSE_TERMS.lease.features.map((feature, i) => (
                   <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                     <Check className="h-3 w-3 text-green-500" />
                     {feature}
                   </li>
                 ))}
               </ul>
             </div>
           </div>
         </div>
       )}
 
       {showExclusive && (
         <div
           className={`relative rounded-lg border-2 p-4 cursor-pointer transition-colors ${
             !isExclusiveAvailable
               ? 'opacity-50 cursor-not-allowed border-muted'
               : selectedLicense === 'exclusive'
               ? 'border-primary bg-primary/5'
               : 'border-muted hover:border-muted-foreground/50'
           }`}
           onClick={() => isExclusiveAvailable && onSelect('exclusive')}
         >
           <div className="flex items-start gap-3">
             <RadioGroupItem 
               value="exclusive" 
               id="exclusive" 
               className="mt-1"
               disabled={!isExclusiveAvailable}
             />
             <div className="flex-1">
               <div className="flex items-center justify-between mb-2">
                 <Label 
                   htmlFor="exclusive" 
                   className={`text-base font-semibold ${!isExclusiveAvailable ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                 >
                   <Crown className="h-4 w-4 inline mr-2 text-yellow-500" />
                   {LICENSE_TERMS.exclusive.title}
                   {!isExclusiveAvailable && (
                     <Badge variant="destructive" className="ml-2">Sold</Badge>
                   )}
                 </Label>
                 <span className="text-xl font-bold text-primary">
                   {formatPrice(exclusivePriceCents)}
                 </span>
               </div>
               <ul className="space-y-1">
                 {LICENSE_TERMS.exclusive.features.map((feature, i) => (
                   <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                     <Check className="h-3 w-3 text-green-500" />
                     {feature}
                   </li>
                 ))}
               </ul>
             </div>
           </div>
           {showLease && showExclusive && isExclusiveAvailable && (
             <Badge className="absolute -top-2 -right-2 bg-yellow-500">Best Value</Badge>
           )}
         </div>
       )}
     </RadioGroup>
   );
 }