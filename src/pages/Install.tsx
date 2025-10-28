import { useState, useEffect } from 'react';
import { Download, Smartphone, Monitor, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Navigation from '@/components/Navigation';
import { Helmet } from 'react-helmet-async';

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return (
    <>
      <Helmet>
        <title>Install MixClub App - Professional Music Mixing</title>
        <meta 
          name="description" 
          content="Install MixClub as a mobile app for faster access, offline support, and native-like experience. Works on iPhone and Android." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navigation />
        
        <main className="container mx-auto px-4 py-24">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary-glow mb-4">
                <Download className="w-10 h-10 text-primary-foreground" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">
                Install MixClub App
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Get the best experience with our installable web app. Fast, offline-ready, and feels just like a native app.
              </p>
            </div>

            {/* Install Status */}
            {isInstalled ? (
              <Card className="p-8 text-center border-2 border-primary">
                <Check className="w-16 h-16 mx-auto mb-4 text-primary" />
                <h2 className="text-2xl font-bold mb-2">App Installed!</h2>
                <p className="text-muted-foreground mb-6">
                  MixClub is now installed on your device. You can find it on your home screen or app drawer.
                </p>
                <Button size="lg" onClick={() => window.location.href = '/'}>
                  Open MixClub
                </Button>
              </Card>
            ) : (
              <>
                {/* Install Button (Chrome/Edge) */}
                {isInstallable && (
                  <Card className="p-8 text-center bg-gradient-to-br from-primary/10 to-primary-glow/10 border-2 border-primary">
                    <h2 className="text-2xl font-bold mb-4">Quick Install</h2>
                    <p className="text-muted-foreground mb-6">
                      Click the button below to install MixClub to your device
                    </p>
                    <Button size="lg" onClick={handleInstallClick}>
                      <Download className="w-5 h-5 mr-2" />
                      Install Now
                    </Button>
                  </Card>
                )}

                {/* iOS Instructions */}
                <Card className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <Smartphone className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-4">Install on iPhone/iPad</h2>
                      <ol className="space-y-3 text-muted-foreground">
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                            1
                          </span>
                          <span>Tap the <strong>Share</strong> button at the bottom of Safari</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                            2
                          </span>
                          <span>Scroll down and tap <strong>Add to Home Screen</strong></span>
                        </li>
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                            3
                          </span>
                          <span>Tap <strong>Add</strong> in the top right corner</span>
                        </li>
                      </ol>
                    </div>
                  </div>
                </Card>

                {/* Android Instructions */}
                <Card className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <Smartphone className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-4">Install on Android</h2>
                      <ol className="space-y-3 text-muted-foreground">
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                            1
                          </span>
                          <span>Tap the <strong>three dots menu</strong> in Chrome</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                            2
                          </span>
                          <span>Tap <strong>Add to Home screen</strong> or <strong>Install app</strong></span>
                        </li>
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                            3
                          </span>
                          <span>Tap <strong>Add</strong> or <strong>Install</strong></span>
                        </li>
                      </ol>
                    </div>
                  </div>
                </Card>

                {/* Desktop Instructions */}
                <Card className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <Monitor className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-4">Install on Desktop</h2>
                      <ol className="space-y-3 text-muted-foreground">
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                            1
                          </span>
                          <span>Look for the <strong>install icon</strong> in your browser's address bar (Chrome, Edge, Brave)</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                            2
                          </span>
                          <span>Click it and choose <strong>Install</strong></span>
                        </li>
                        <li className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                            3
                          </span>
                          <span>The app will open in its own window</span>
                        </li>
                      </ol>
                    </div>
                  </div>
                </Card>
              </>
            )}

            {/* Benefits */}
            <Card className="p-8 bg-gradient-to-br from-secondary/50 to-accent/50">
              <h2 className="text-2xl font-bold mb-6 text-center">Why Install?</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                    <Check className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Faster Access</h3>
                  <p className="text-sm text-muted-foreground">
                    Launch instantly from your home screen
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                    <Check className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Works Offline</h3>
                  <p className="text-sm text-muted-foreground">
                    Access your projects even without internet
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                    <Check className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Native Feel</h3>
                  <p className="text-sm text-muted-foreground">
                    Runs in its own window like a real app
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
}
