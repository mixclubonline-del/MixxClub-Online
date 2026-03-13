/**
 * AdminScreenshotTool — Captures screenshots of every platform route,
 * then exports them as a ZIP archive or a PDF lookbook.
 *
 * Uses same-origin iframes + html2canvas for capture.
 */

import { useState, useRef, useCallback } from 'react';
import { Camera, Download, FileText, Loader2, CheckCircle2, XCircle, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import { toast } from 'sonner';
import { ROUTES } from '@/config/routes';

interface CapturedSlide {
  route: string;
  label: string;
  dataUrl: string;
  status: 'pending' | 'capturing' | 'done' | 'error';
  error?: string;
}

// Build route list from ROUTES config
const ALL_ROUTES = Object.entries(ROUTES).map(([key, path]) => ({
  key,
  path,
  label: key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase()),
}));

// Routes that require auth or cause redirects — skip by default
const SKIP_BY_DEFAULT = new Set([
  'AUTH', 'AUTH_CALLBACK', 'DEMO_LOGIN',
]);

export function AdminScreenshotTool() {
  const [captures, setCaptures] = useState<CapturedSlide[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentRoute, setCurrentRoute] = useState('');
  const [selectedRoutes, setSelectedRoutes] = useState<Set<string>>(
    new Set(ALL_ROUTES.filter((r) => !SKIP_BY_DEFAULT.has(r.key)).map((r) => r.key))
  );
  const [viewportWidth, setViewportWidth] = useState(1920);
  const [viewportHeight, setViewportHeight] = useState(1080);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const pauseRef = useRef(false);
  const cancelRef = useRef(false);

  const toggleRoute = (key: string) => {
    setSelectedRoutes((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectAll = () => setSelectedRoutes(new Set(ALL_ROUTES.map((r) => r.key)));
  const selectNone = () => setSelectedRoutes(new Set());

  const waitForIframeLoad = (iframe: HTMLIFrameElement, timeoutMs = 8000): Promise<void> => {
    return new Promise((resolve) => {
      let resolved = false;
      const done = () => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      };
      iframe.addEventListener('load', done, { once: true });
      setTimeout(done, timeoutMs);
    });
  };

  const captureRoute = async (route: string): Promise<string> => {
    const iframe = iframeRef.current;
    if (!iframe) throw new Error('Iframe not available');

    // Navigate iframe
    iframe.src = route;
    await waitForIframeLoad(iframe);

    // Extra wait for charts/animations
    await new Promise((r) => setTimeout(r, 1500));

    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc?.body) throw new Error('Cannot access iframe document');

      const canvas = await html2canvas(iframeDoc.body, {
        width: viewportWidth,
        height: viewportHeight,
        scale: 1,
        useCORS: true,
        backgroundColor: '#0a0812',
        logging: false,
        windowWidth: viewportWidth,
        windowHeight: viewportHeight,
      });

      return canvas.toDataURL('image/png');
    } catch {
      // Fallback: capture the iframe element itself
      const canvas = await html2canvas(iframe, {
        width: viewportWidth,
        height: viewportHeight,
        scale: 1,
        useCORS: true,
        backgroundColor: '#0a0812',
        logging: false,
      });
      return canvas.toDataURL('image/png');
    }
  };

  const runCapture = useCallback(async () => {
    const routesToCapture = ALL_ROUTES.filter((r) => selectedRoutes.has(r.key));
    if (routesToCapture.length === 0) {
      toast.error('No routes selected');
      return;
    }

    setIsRunning(true);
    setIsPaused(false);
    cancelRef.current = false;
    pauseRef.current = false;

    const results: CapturedSlide[] = routesToCapture.map((r) => ({
      route: r.path,
      label: r.label,
      dataUrl: '',
      status: 'pending',
    }));
    setCaptures(results);

    for (let i = 0; i < routesToCapture.length; i++) {
      if (cancelRef.current) break;

      // Handle pause
      while (pauseRef.current && !cancelRef.current) {
        await new Promise((r) => setTimeout(r, 200));
      }
      if (cancelRef.current) break;

      const route = routesToCapture[i];
      setCurrentRoute(route.path);
      setProgress(((i) / routesToCapture.length) * 100);

      // Update status to capturing
      setCaptures((prev) =>
        prev.map((c, idx) => (idx === i ? { ...c, status: 'capturing' } : c))
      );

      try {
        const dataUrl = await captureRoute(route.path);
        setCaptures((prev) =>
          prev.map((c, idx) => (idx === i ? { ...c, dataUrl, status: 'done' } : c))
        );
      } catch (err: any) {
        console.error(`Failed to capture ${route.path}:`, err);
        setCaptures((prev) =>
          prev.map((c, idx) =>
            idx === i ? { ...c, status: 'error', error: err.message } : c
          )
        );
      }
    }

    setProgress(100);
    setCurrentRoute('');
    setIsRunning(false);
    toast.success(`Captured ${routesToCapture.length} routes`);
  }, [selectedRoutes, viewportWidth, viewportHeight]);

  const togglePause = () => {
    pauseRef.current = !pauseRef.current;
    setIsPaused(!isPaused);
  };

  const cancelCapture = () => {
    cancelRef.current = true;
    pauseRef.current = false;
    setIsRunning(false);
    setIsPaused(false);
  };

  const completedCaptures = captures.filter((c) => c.status === 'done');

  const exportAsZip = async () => {
    if (completedCaptures.length === 0) {
      toast.error('No screenshots to export');
      return;
    }

    toast.info('Building ZIP archive...');
    const zip = new JSZip();
    const folder = zip.folder('mixxclub-screenshots');

    for (const cap of completedCaptures) {
      const slug = cap.route.replace(/\//g, '_').replace(/^_/, '') || 'home';
      const base64 = cap.dataUrl.split(',')[1];
      folder?.file(`${slug}.png`, base64, { base64: true });
    }

    // Add manifest
    folder?.file(
      'manifest.json',
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          viewport: `${viewportWidth}x${viewportHeight}`,
          totalRoutes: completedCaptures.length,
          routes: completedCaptures.map((c) => ({
            route: c.route,
            label: c.label,
            file: `${c.route.replace(/\//g, '_').replace(/^_/, '') || 'home'}.png`,
          })),
        },
        null,
        2
      )
    );

    const blob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(blob, 'mixxclub-screenshots.zip');
    toast.success('ZIP downloaded');
  };

  const exportAsPDF = async () => {
    if (completedCaptures.length === 0) {
      toast.error('No screenshots to export');
      return;
    }

    toast.info('Building PDF lookbook...');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [viewportWidth, viewportHeight],
    });

    for (let i = 0; i < completedCaptures.length; i++) {
      const cap = completedCaptures[i];
      if (i > 0) pdf.addPage([viewportWidth, viewportHeight], 'landscape');

      pdf.addImage(cap.dataUrl, 'PNG', 0, 0, viewportWidth, viewportHeight);

      // Route label overlay
      pdf.setFontSize(14);
      pdf.setTextColor(255, 255, 255);
      pdf.setFillColor(0, 0, 0);
      const labelText = `${cap.label}  •  ${cap.route}`;
      const textWidth = pdf.getTextWidth(labelText) + 20;
      pdf.roundedRect(20, viewportHeight - 50, textWidth, 30, 4, 4, 'F');
      pdf.text(labelText, 30, viewportHeight - 30);
    }

    pdf.save('MixxClub-Platform-Lookbook.pdf');
    toast.success('PDF lookbook downloaded');
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const doneCount = captures.filter((c) => c.status === 'done').length;
  const errorCount = captures.filter((c) => c.status === 'error').length;

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            Platform Screenshot Tool
          </CardTitle>
          <CardDescription>
            Capture every route as a screenshot, then export as a ZIP archive or PDF lookbook.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Viewport config */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Viewport:</label>
              <select
                className="bg-muted/50 border border-border rounded px-2 py-1 text-sm"
                value={`${viewportWidth}x${viewportHeight}`}
                onChange={(e) => {
                  const [w, h] = e.target.value.split('x').map(Number);
                  setViewportWidth(w);
                  setViewportHeight(h);
                }}
                disabled={isRunning}
              >
                <option value="1920x1080">Desktop (1920×1080)</option>
                <option value="1366x768">Laptop (1366×768)</option>
                <option value="768x1024">Tablet (768×1024)</option>
                <option value="390x844">Mobile (390×844)</option>
              </select>
            </div>
            <Badge variant="outline">
              {selectedRoutes.size} / {ALL_ROUTES.length} routes selected
            </Badge>
          </div>

          {/* Route selection */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={selectAll} disabled={isRunning}>
                Select All
              </Button>
              <Button variant="ghost" size="sm" onClick={selectNone} disabled={isRunning}>
                Select None
              </Button>
            </div>
            <ScrollArea className="h-48 border border-border rounded-lg p-3">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {ALL_ROUTES.map((r) => (
                  <label
                    key={r.key}
                    className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted/30 rounded px-2 py-1"
                  >
                    <Checkbox
                      checked={selectedRoutes.has(r.key)}
                      onCheckedChange={() => toggleRoute(r.key)}
                      disabled={isRunning}
                    />
                    <span className="truncate text-muted-foreground">{r.path}</span>
                  </label>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            {!isRunning ? (
              <Button onClick={runCapture} className="gap-2">
                <Camera className="w-4 h-4" />
                Start Capture ({selectedRoutes.size} routes)
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={togglePause} className="gap-2">
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button variant="destructive" onClick={cancelCapture} size="sm">
                  Cancel
                </Button>
              </>
            )}

            {completedCaptures.length > 0 && !isRunning && (
              <>
                <Button variant="outline" onClick={exportAsZip} className="gap-2">
                  <Download className="w-4 h-4" />
                  Download ZIP ({completedCaptures.length})
                </Button>
                <Button variant="outline" onClick={exportAsPDF} className="gap-2">
                  <FileText className="w-4 h-4" />
                  Download PDF Lookbook
                </Button>
              </>
            )}
          </div>

          {/* Progress */}
          {isRunning && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {isPaused ? 'Paused' : 'Capturing'}: {currentRoute}
                </span>
                <span className="font-mono text-primary">
                  {doneCount + errorCount}/{captures.length}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Results grid */}
          {captures.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium flex items-center gap-2">
                Results
                {doneCount > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    {doneCount} captured
                  </Badge>
                )}
                {errorCount > 0 && (
                  <Badge variant="destructive" className="gap-1">
                    <XCircle className="w-3 h-3" />
                    {errorCount} failed
                  </Badge>
                )}
              </h3>
              <ScrollArea className="h-[400px]">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {captures.map((cap, idx) => (
                    <div
                      key={idx}
                      className="border border-border rounded-lg overflow-hidden bg-muted/20"
                    >
                      {cap.status === 'done' && cap.dataUrl ? (
                        <img
                          src={cap.dataUrl}
                          alt={cap.label}
                          className="w-full aspect-video object-cover"
                        />
                      ) : (
                        <div className="w-full aspect-video flex items-center justify-center bg-muted/30">
                          {cap.status === 'capturing' && (
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                          )}
                          {cap.status === 'pending' && (
                            <span className="text-xs text-muted-foreground">Pending</span>
                          )}
                          {cap.status === 'error' && (
                            <XCircle className="w-5 h-5 text-destructive" />
                          )}
                        </div>
                      )}
                      <div className="px-2 py-1.5">
                        <p className="text-xs font-medium truncate">{cap.label}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{cap.route}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hidden iframe for capture */}
      <iframe
        ref={iframeRef}
        className="fixed -left-[9999px] top-0 border-none"
        style={{ width: viewportWidth, height: viewportHeight }}
        title="Screenshot capture"
      />
    </div>
  );
}
