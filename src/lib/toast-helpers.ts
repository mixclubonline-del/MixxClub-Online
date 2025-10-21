import { toast } from '@/hooks/use-toast';

// Success toasts
export const showSuccessToast = (message: string, description?: string) => {
  toast({
    title: message,
    description,
    duration: 3000,
  });
};

// Error toasts
export const showErrorToast = (message: string = 'Something went wrong', description?: string) => {
  toast({
    variant: 'destructive',
    title: message,
    description: description || 'Please try again later.',
    duration: 5000,
  });
};

// Loading toast with promise
export const showLoadingToast = async <T,>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error?: string;
  }
): Promise<T> => {
  const { dismiss } = toast({
    title: messages.loading,
    duration: Infinity,
  });

  try {
    const result = await promise;
    dismiss();
    showSuccessToast(messages.success);
    return result;
  } catch (error) {
    dismiss();
    showErrorToast(messages.error || 'Failed to complete action');
    throw error;
  }
};

// Offline toast
export const showOfflineToast = () => {
  toast({
    title: 'You are offline',
    description: 'Changes will be synced when connection is restored.',
    duration: 5000,
  });
};

// Network error toast
export const showNetworkErrorToast = () => {
  toast({
    variant: 'destructive',
    title: 'Network Error',
    description: 'Please check your internet connection.',
    duration: 5000,
  });
};

// Copy to clipboard toast
export const showCopyToast = (label: string = 'Text') => {
  toast({
    title: 'Copied!',
    description: `${label} copied to clipboard`,
    duration: 2000,
  });
};

// File upload toast
export const showUploadToast = (fileName: string) => {
  toast({
    title: 'Upload complete',
    description: `${fileName} has been uploaded successfully`,
    duration: 3000,
  });
};

// Delete confirmation toast
export const showDeleteToast = (itemName: string) => {
  toast({
    title: 'Deleted',
    description: `${itemName} has been deleted.`,
    duration: 3000,
  });
};
