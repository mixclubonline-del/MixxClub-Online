import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type CopyType = 'landing-hero' | 'landing-features' | 'email-welcome' | 'email-promo' | 'social-post' | 'tagline';

interface GeneratedCopy {
  type: CopyType;
  content: string;
  variations?: string[];
}

export function usePrimeMarketing() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCopy, setGeneratedCopy] = useState<GeneratedCopy | null>(null);

  const generateCopy = async (type: CopyType, context: string) => {
    setIsGenerating(true);
    try {
      const prompts: Record<CopyType, string> = {
        'landing-hero': `Generate compelling landing page hero copy for Mixxclub - a platform connecting artists with audio engineers. Context: ${context}. Return JSON with: headline (max 10 words), subheadline (max 25 words), cta (call-to-action button text, max 4 words).`,
        'landing-features': `Generate 3 feature descriptions for Mixxclub. Context: ${context}. Return JSON array with objects containing: title (max 5 words), description (max 20 words), icon (suggested lucide icon name).`,
        'email-welcome': `Write a welcome email for new Mixxclub users. Context: ${context}. Return JSON with: subject (max 10 words), preheader (max 15 words), body (3 paragraphs, warm and engaging), cta (button text).`,
        'email-promo': `Write a promotional email for Mixxclub. Context: ${context}. Return JSON with: subject (max 10 words), preheader (max 15 words), body (persuasive, 2-3 paragraphs), cta (button text), urgency (optional urgency line).`,
        'social-post': `Generate 3 social media post variations for Mixxclub. Context: ${context}. Return JSON array with objects containing: platform (twitter/instagram/linkedin), content (platform-appropriate length), hashtags (array of 3-5 hashtags).`,
        'tagline': `Generate 5 tagline variations for Mixxclub. Context: ${context}. Return JSON array of strings, each max 8 words, memorable and punchy.`
      };

      const { data, error } = await supabase.functions.invoke('prime-chat', {
        body: {
          messages: [
            { role: 'system', content: 'You are Prime, Mixxclub\'s marketing expert. Generate compelling, hip-hop culture-aware marketing copy. Always respond with valid JSON only, no markdown.' },
            { role: 'user', content: prompts[type] }
          ]
        }
      });

      if (error) throw error;

      const content = data?.response || data?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      
      setGeneratedCopy({
        type,
        content: jsonMatch ? jsonMatch[0] : content
      });

      toast.success('Marketing copy generated!');
    } catch (error) {
      console.error('Error generating copy:', error);
      toast.error('Failed to generate copy');
    } finally {
      setIsGenerating(false);
    }
  };

  return { generateCopy, isGenerating, generatedCopy, setGeneratedCopy };
}
