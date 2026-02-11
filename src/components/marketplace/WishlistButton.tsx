import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsWishlisted, useToggleWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
    productId: string;
    variant?: 'icon' | 'button';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function WishlistButton({ productId, variant = 'icon', size = 'md', className }: WishlistButtonProps) {
    const { user } = useAuth();
    const { data: isWishlisted } = useIsWishlisted(productId);
    const toggleWishlist = useToggleWishlist();

    const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };
    const buttonSizes = { sm: 'h-8 w-8', md: 'h-9 w-9', lg: 'h-10 w-10' };

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (!user) return;
        toggleWishlist.mutate(productId);
    };

    if (variant === 'icon') {
        return (
            <button
                onClick={handleClick}
                disabled={!user || toggleWishlist.isPending}
                className={cn(
                    'inline-flex items-center justify-center rounded-full transition-all duration-200',
                    'hover:bg-red-50 dark:hover:bg-red-950/30',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    buttonSizes[size],
                    className
                )}
                title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
                <Heart
                    className={cn(
                        sizes[size],
                        'transition-all duration-200',
                        isWishlisted
                            ? 'fill-red-500 text-red-500 scale-110'
                            : 'text-muted-foreground hover:text-red-400'
                    )}
                />
            </button>
        );
    }

    return (
        <Button
            variant={isWishlisted ? 'default' : 'outline'}
            size={size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'default'}
            onClick={handleClick}
            disabled={!user || toggleWishlist.isPending}
            className={cn(
                'gap-2',
                isWishlisted && 'bg-red-500 hover:bg-red-600 text-white border-red-500',
                className
            )}
        >
            <Heart className={cn('w-4 h-4', isWishlisted && 'fill-current')} />
            {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
        </Button>
    );
}
