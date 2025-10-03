import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Smartphone, Download, Terminal, CheckCircle2 } from "lucide-react";

export const MobileBuildGuide = () => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-primary" />
          <CardTitle>Mobile Build Instructions</CardTitle>
        </div>
        <CardDescription>
          Step-by-step guide to build native Android/iOS apps
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="android" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="android">Android</TabsTrigger>
            <TabsTrigger value="ios">iOS</TabsTrigger>
          </TabsList>

          <TabsContent value="android" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-1">1</Badge>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Export to GitHub</p>
                  <p className="text-xs text-muted-foreground">
                    Click "Export to GitHub" button and pull your repo
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-1">2</Badge>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Install Dependencies</p>
                  <div className="mt-2 p-2 bg-muted rounded text-xs font-mono flex items-center justify-between">
                    <span>npm install</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => copyToClipboard("npm install")}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-1">3</Badge>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Add Android Platform</p>
                  <div className="mt-2 p-2 bg-muted rounded text-xs font-mono flex items-center justify-between">
                    <span>npx cap add android</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => copyToClipboard("npx cap add android")}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-1">4</Badge>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Build Web Assets</p>
                  <div className="mt-2 p-2 bg-muted rounded text-xs font-mono flex items-center justify-between">
                    <span>npm run build</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => copyToClipboard("npm run build")}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-1">5</Badge>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Sync Native Project</p>
                  <div className="mt-2 p-2 bg-muted rounded text-xs font-mono flex items-center justify-between">
                    <span>npx cap sync android</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => copyToClipboard("npx cap sync android")}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-1">6</Badge>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Run on Device/Emulator</p>
                  <div className="mt-2 p-2 bg-muted rounded text-xs font-mono flex items-center justify-between">
                    <span>npx cap run android</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => copyToClipboard("npx cap run android")}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-yellow-500/10 rounded mt-4">
                <p className="text-xs font-semibold mb-1">Requirements:</p>
                <ul className="text-xs space-y-1 list-disc list-inside">
                  <li>Android Studio installed</li>
                  <li>Android SDK (API 22+)</li>
                  <li>JDK 17 or higher</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ios" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-1">1</Badge>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Export to GitHub</p>
                  <p className="text-xs text-muted-foreground">
                    Click "Export to GitHub" button and pull your repo
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-1">2</Badge>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Install Dependencies</p>
                  <div className="mt-2 p-2 bg-muted rounded text-xs font-mono flex items-center justify-between">
                    <span>npm install</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => copyToClipboard("npm install")}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-1">3</Badge>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Add iOS Platform</p>
                  <div className="mt-2 p-2 bg-muted rounded text-xs font-mono flex items-center justify-between">
                    <span>npx cap add ios</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => copyToClipboard("npx cap add ios")}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-1">4</Badge>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Build Web Assets</p>
                  <div className="mt-2 p-2 bg-muted rounded text-xs font-mono flex items-center justify-between">
                    <span>npm run build</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => copyToClipboard("npm run build")}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-1">5</Badge>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Install CocoaPods</p>
                  <div className="mt-2 p-2 bg-muted rounded text-xs font-mono flex items-center justify-between">
                    <span>cd ios/App && pod install</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => copyToClipboard("cd ios/App && pod install")}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-1">6</Badge>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Sync Native Project</p>
                  <div className="mt-2 p-2 bg-muted rounded text-xs font-mono flex items-center justify-between">
                    <span>npx cap sync ios</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => copyToClipboard("npx cap sync ios")}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Badge variant="outline" className="mt-1">7</Badge>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Run on Device/Simulator</p>
                  <div className="mt-2 p-2 bg-muted rounded text-xs font-mono flex items-center justify-between">
                    <span>npx cap run ios</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => copyToClipboard("npx cap run ios")}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-yellow-500/10 rounded mt-4">
                <p className="text-xs font-semibold mb-1">Requirements:</p>
                <ul className="text-xs space-y-1 list-disc list-inside">
                  <li>macOS required</li>
                  <li>Xcode 14+ installed</li>
                  <li>Apple Developer account</li>
                  <li>CocoaPods installed</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 bg-blue-500/10 rounded">
          <div className="flex items-start gap-2">
            <Terminal className="h-4 w-4 text-blue-500 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-semibold">Pro Tips:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Update capacitor.config.ts with production URLs before building</li>
                <li>Test hot-reload during development to speed up testing</li>
                <li>Use "npx cap open android/ios" to open in native IDEs</li>
                <li>Run "npx cap doctor" to check for configuration issues</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
