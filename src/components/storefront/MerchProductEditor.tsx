import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useStorefrontProducts } from '@/hooks/useStorefront';
import { toast } from 'sonner';
import { Package, DollarSign } from 'lucide-react';

interface MerchProductEditorProps {
  product?: any;
  storefrontId: string;
  onClose: () => void;
}

export const MerchProductEditor = ({ product, storefrontId, onClose }: MerchProductEditorProps) => {
  const { createProduct, updateProduct } = useStorefrontProducts(storefrontId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    thumbnail_url: product?.thumbnail_url || '',
    price: product?.price?.toString() || '',
    category: product?.category || 'apparel',
    inventory_count: product?.inventory_count?.toString() || '',
    is_active: product?.is_active ?? true
  });

  const categories = [
    { value: 'apparel', label: 'Apparel' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'digital', label: 'Digital' },
    { value: 'vinyl', label: 'Vinyl' },
    { value: 'poster', label: 'Posters' },
    { value: 'bundle', label: 'Bundles' },
    { value: 'other', label: 'Other' }
  ];

  const handleSubmit = async () => {
    if (!formData.name || !formData.price) {
      toast.error('Please fill in required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const productData = {
        storefront_id: storefrontId,
        name: formData.name,
        description: formData.description,
        thumbnail_url: formData.thumbnail_url,
        price: parseFloat(formData.price),
        category: formData.category,
        inventory_count: formData.inventory_count ? parseInt(formData.inventory_count) : null,
        is_active: formData.is_active
      };

      if (product) {
        updateProduct({ id: product.id, ...productData });
        toast.success('Product updated!');
      } else {
        await createProduct(productData);
        toast.success('Product created!');
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            {product ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Limited Edition T-Shirt"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your product..."
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail">Image URL</Label>
            <Input
              id="thumbnail"
              placeholder="https://..."
              value={formData.thumbnail_url}
              onChange={(e) => setFormData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
            />
            {formData.thumbnail_url && (
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted mt-2">
                <img 
                  src={formData.thumbnail_url} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="29.99"
                  className="pl-9"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="inventory">Inventory</Label>
              <Input
                id="inventory"
                type="number"
                placeholder="Unlimited"
                value={formData.inventory_count}
                onChange={(e) => setFormData(prev => ({ ...prev, inventory_count: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Active</Label>
              <p className="text-sm text-muted-foreground">Make this product visible in your store</p>
            </div>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
