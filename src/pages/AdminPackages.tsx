import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Edit, Plus, Package } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface PackageType {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  track_limit: number;
  features: string[];
  is_active: boolean;
}

export default function AdminPackages() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mixingPackages, setMixingPackages] = useState<PackageType[]>([]);
  const [masteringPackages, setMasteringPackages] = useState<PackageType[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [editPackage, setEditPackage] = useState<PackageType | null>(null);
  const [packageType, setPackageType] = useState<'mixing' | 'mastering'>('mixing');

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [trackLimit, setTrackLimit] = useState('');
  const [features, setFeatures] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      checkAdminStatus();
      fetchPackages();
    }
  }, [user, loading, navigate]);

  const checkAdminStatus = async () => {
    const { data, error } = await supabase.rpc('is_admin', { user_uuid: user?.id });
    if (error || !data) {
      navigate('/');
    }
  };

  const fetchPackages = async () => {
    try {
      const [mixingRes, masteringRes] = await Promise.all([
        supabase.from('mixing_packages').select('*').order('price', { ascending: true }),
        supabase.from('mastering_packages').select('*').order('price', { ascending: true }),
      ]);

      if (mixingRes.error) throw mixingRes.error;
      if (masteringRes.error) throw masteringRes.error;

      // Transform features from Json to string[]
      const transformPackages = (data: any[]): PackageType[] => {
        return data.map(pkg => ({
          ...pkg,
          features: Array.isArray(pkg.features) ? pkg.features : []
        }));
      };

      setMixingPackages(transformPackages(mixingRes.data || []));
      setMasteringPackages(transformPackages(masteringRes.data || []));
    } catch (error: any) {
      toast.error('Failed to fetch packages');
    } finally {
      setDataLoading(false);
    }
  };

  const openEditDialog = (pkg: PackageType, type: 'mixing' | 'mastering') => {
    setEditPackage(pkg);
    setPackageType(type);
    setName(pkg.name);
    setDescription(pkg.description || '');
    setPrice(pkg.price.toString());
    setTrackLimit(pkg.track_limit.toString());
    setFeatures(Array.isArray(pkg.features) ? pkg.features.join('\n') : '');
    setIsActive(pkg.is_active);
  };

  const resetForm = () => {
    setEditPackage(null);
    setName('');
    setDescription('');
    setPrice('');
    setTrackLimit('');
    setFeatures('');
    setIsActive(true);
  };

  const handleSave = async () => {
    if (!name || !price) {
      toast.error('Name and price are required');
      return;
    }

    const featuresArray = features
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const packageData = {
      name,
      description: description || null,
      price: parseFloat(price),
      track_limit: trackLimit ? parseInt(trackLimit) : -1,
      features: featuresArray,
      is_active: isActive,
    };

    try {
      const table = packageType === 'mixing' ? 'mixing_packages' : 'mastering_packages';

      if (editPackage) {
        const { error } = await supabase
          .from(table)
          .update(packageData)
          .eq('id', editPackage.id);

        if (error) throw error;
        toast.success('Package updated successfully');
      } else {
        const { error } = await supabase.from(table).insert(packageData);

        if (error) throw error;
        toast.success('Package created successfully');
      }

      resetForm();
      fetchPackages();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save package');
    }
  };

  if (loading || dataLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Package Management</h1>
          <p className="text-muted-foreground">
            Manage pricing and features for mixing and mastering packages
          </p>
        </div>

        {/* Mixing Packages */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mixing Packages</CardTitle>
                <CardDescription>{mixingPackages.length} package(s)</CardDescription>
              </div>
              <Button
                onClick={() => {
                  resetForm();
                  setPackageType('mixing');
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Package
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mixingPackages.map((pkg) => (
                <Card key={pkg.id} className={!pkg.is_active ? 'opacity-50' : ''}>
                  <CardHeader>
                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                    <CardDescription>
                      ${pkg.price}/{pkg.track_limit === -1 ? 'unlimited' : `${pkg.track_limit} tracks`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{pkg.description}</p>
                    <ul className="text-sm space-y-1 mb-4">
                      {Array.isArray(pkg.features) &&
                        pkg.features.slice(0, 3).map((f, i) => (
                          <li key={i} className="text-muted-foreground">
                            • {f}
                          </li>
                        ))}
                    </ul>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(pkg, 'mixing')}
                      className="w-full"
                    >
                      <Edit className="h-3 w-3 mr-2" />
                      Edit
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mastering Packages */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mastering Packages</CardTitle>
                <CardDescription>{masteringPackages.length} package(s)</CardDescription>
              </div>
              <Button
                onClick={() => {
                  resetForm();
                  setPackageType('mastering');
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Package
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {masteringPackages.map((pkg) => (
                <Card key={pkg.id} className={!pkg.is_active ? 'opacity-50' : ''}>
                  <CardHeader>
                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                    <CardDescription>
                      ${pkg.price}/{pkg.track_limit === -1 ? 'unlimited' : `${pkg.track_limit} tracks`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{pkg.description}</p>
                    <ul className="text-sm space-y-1 mb-4">
                      {Array.isArray(pkg.features) &&
                        pkg.features.slice(0, 3).map((f, i) => (
                          <li key={i} className="text-muted-foreground">
                            • {f}
                          </li>
                        ))}
                    </ul>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(pkg, 'mastering')}
                      className="w-full"
                    >
                      <Edit className="h-3 w-3 mr-2" />
                      Edit
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={editPackage !== null || name !== ''} onOpenChange={() => resetForm()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editPackage ? 'Edit' : 'Create'} {packageType === 'mixing' ? 'Mixing' : 'Mastering'} Package
            </DialogTitle>
            <DialogDescription>
              Configure package pricing, limits, and features
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Package Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Starter, Pro, Premium"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price (USD) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="99.99"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the package..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trackLimit">Track Limit (-1 for unlimited)</Label>
              <Input
                id="trackLimit"
                type="number"
                value={trackLimit}
                onChange={(e) => setTrackLimit(e.target.value)}
                placeholder="-1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">Features (one per line)</Label>
              <Textarea
                id="features"
                value={features}
                onChange={(e) => setFeatures(e.target.value)}
                placeholder="Premium stems processing&#10;24-hour turnaround&#10;Unlimited revisions"
                rows={6}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
              <Label htmlFor="active">Package is active and visible to users</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Package className="h-4 w-4 mr-2" />
              {editPackage ? 'Update' : 'Create'} Package
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
