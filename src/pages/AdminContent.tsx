import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Search, Music, Image, Video, Headphones, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { DataTablePagination } from '@/components/ui/data-table-pagination';

export default function AdminContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeTab, setActiveTab] = useState('audio');

  // Fetch audio files
  const { data: audioData, isLoading: loadingAudio } = useQuery({
    queryKey: ['admin-content-audio', currentPage, pageSize, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('audio_files')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.ilike('file_name', `%${searchQuery}%`);
      }

      const from = (currentPage - 1) * pageSize;
      query = query.range(from, from + pageSize - 1);

      const { data, error, count } = await query;
      if (error) throw error;
      return { files: data || [], total: count || 0 };
    },
    enabled: activeTab === 'audio',
  });

  // Fetch demo beats
  const { data: beatsData, isLoading: loadingBeats } = useQuery({
    queryKey: ['admin-content-beats', currentPage, pageSize, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('demo_beats')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,genre.ilike.%${searchQuery}%`);
      }

      const from = (currentPage - 1) * pageSize;
      query = query.range(from, from + pageSize - 1);

      const { data, error, count } = await query;
      if (error) throw error;
      return { beats: data || [], total: count || 0 };
    },
    enabled: activeTab === 'beats',
  });

  // Fetch brand assets
  const { data: assetsData, isLoading: loadingAssets } = useQuery({
    queryKey: ['admin-content-assets', currentPage, pageSize, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('brand_assets')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      const from = (currentPage - 1) * pageSize;
      query = query.range(from, from + pageSize - 1);

      const { data, error, count } = await query;
      if (error) throw error;
      return { assets: data || [], total: count || 0 };
    },
    enabled: activeTab === 'assets',
  });

  // Content stats
  const { data: stats } = useQuery({
    queryKey: ['admin-content-stats'],
    queryFn: async () => {
      const [audioRes, beatsRes, assetsRes] = await Promise.all([
        supabase.from('audio_files').select('id', { count: 'exact', head: true }),
        supabase.from('demo_beats').select('id', { count: 'exact', head: true }),
        supabase.from('brand_assets').select('id', { count: 'exact', head: true }),
      ]);
      return {
        audioFiles: audioRes.count || 0,
        demoBeats: beatsRes.count || 0,
        brandAssets: assetsRes.count || 0,
      };
    },
  });

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return mb > 1 ? `${mb.toFixed(2)} MB` : `${(bytes / 1024).toFixed(2)} KB`;
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'audio': return { data: audioData?.files || [], total: audioData?.total || 0, loading: loadingAudio };
      case 'beats': return { data: beatsData?.beats || [], total: beatsData?.total || 0, loading: loadingBeats };
      case 'assets': return { data: assetsData?.assets || [], total: assetsData?.total || 0, loading: loadingAssets };
      default: return { data: [], total: 0, loading: false };
    }
  };

  const currentData = getCurrentData();
  const totalPages = Math.ceil(currentData.total / pageSize);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Content Management</h1>
            <p className="text-muted-foreground">
              Manage audio files, beats, and brand assets
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Audio Files</CardTitle>
              <Headphones className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.audioFiles || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Demo Beats</CardTitle>
              <Music className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.demoBeats || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Brand Assets</CardTitle>
              <Image className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.brandAssets || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Content</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats?.audioFiles || 0) + (stats?.demoBeats || 0) + (stats?.brandAssets || 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Content Library</CardTitle>
            <CardDescription>Browse and manage platform content</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setCurrentPage(1); }}>
              <TabsList>
                <TabsTrigger value="audio" className="gap-2">
                  <Headphones className="h-4 w-4" /> Audio Files
                </TabsTrigger>
                <TabsTrigger value="beats" className="gap-2">
                  <Music className="h-4 w-4" /> Demo Beats
                </TabsTrigger>
                <TabsTrigger value="assets" className="gap-2">
                  <Image className="h-4 w-4" /> Brand Assets
                </TabsTrigger>
              </TabsList>

              <div className="mt-4">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search content..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10"
                  />
                </div>

                <TabsContent value="audio" className="space-y-3">
                  {currentData.loading ? (
                    <div className="text-center py-8">Loading...</div>
                  ) : audioData?.files.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No audio files found</div>
                  ) : (
                    audioData?.files.map((file) => (
                      <div key={file.id} className="flex items-center gap-4 p-4 rounded-lg border">
                        <Headphones className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <p className="font-medium">{file.file_name}</p>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>{formatFileSize(file.file_size)}</span>
                            <span>{file.duration_seconds ? `${Math.round(file.duration_seconds)}s` : 'N/A'}</span>
                            <span>{format(new Date(file.created_at), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                        <Badge variant="outline">{file.mime_type || 'audio'}</Badge>
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="beats" className="space-y-3">
                  {currentData.loading ? (
                    <div className="text-center py-8">Loading...</div>
                  ) : beatsData?.beats.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No beats found</div>
                  ) : (
                    beatsData?.beats.map((beat) => (
                      <div key={beat.id} className="flex items-center gap-4 p-4 rounded-lg border">
                        <Music className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <p className="font-medium">{beat.title}</p>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>{beat.bpm} BPM</span>
                            <span>{beat.genre}</span>
                            <span>{beat.mood}</span>
                            <span>{beat.play_count || 0} plays</span>
                          </div>
                        </div>
                        {beat.is_featured && <Badge>Featured</Badge>}
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="assets" className="space-y-3">
                  {currentData.loading ? (
                    <div className="text-center py-8">Loading...</div>
                  ) : assetsData?.assets.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No assets found</div>
                  ) : (
                    assetsData?.assets.map((asset) => (
                      <div key={asset.id} className="flex items-center gap-4 p-4 rounded-lg border">
                        <Image className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <p className="font-medium">{asset.name}</p>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>{asset.asset_type}</span>
                            <span>{asset.asset_context || 'general'}</span>
                            <span>{format(new Date(asset.created_at), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                        {asset.is_active && <Badge className="bg-green-500/10 text-green-500">Active</Badge>}
                      </div>
                    ))
                  )}
                </TabsContent>
              </div>

              <DataTablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={currentData.total}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
              />
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
