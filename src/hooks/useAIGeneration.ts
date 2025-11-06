import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseAIGenerationOptions {
  functionName: string;
  successMessage?: string;
  errorMessage?: string;
}

export const useAIGeneration = <T = any>({
  functionName,
  successMessage = "AI generation complete",
  errorMessage = "AI generation failed",
}: UseAIGenerationOptions) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const generate = async (body: any) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const { data: responseData, error: responseError } = await supabase.functions.invoke(
        functionName,
        { body }
      );

      if (responseError) throw responseError;
      if (responseData?.error) throw new Error(responseData.error);

      setData(responseData);
      toast.success(successMessage);
      return responseData;
    } catch (err: any) {
      console.error(`Error in ${functionName}:`, err);
      setError(err);
      
      if (err.message?.includes('Rate limit')) {
        toast.error("Rate limit exceeded. Please try again later.");
      } else if (err.message?.includes('credits')) {
        toast.error("AI credits required. Please add funds to continue.");
      } else {
        toast.error(err.message || errorMessage);
      }
      
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
  };

  return {
    generate,
    isGenerating,
    data,
    error,
    reset,
  };
};
