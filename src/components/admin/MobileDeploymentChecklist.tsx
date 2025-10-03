import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Smartphone, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";

interface ChecklistItem {
  id: string;
  label: string;
  category: string;
  completed: boolean;
  required: boolean;
}

export const MobileDeploymentChecklist = () => {
  const [items, setItems] = useState<ChecklistItem[]>([
    // Pre-Deployment
    { id: "1", label: "Run npm install & npm run build successfully", category: "Pre-Deployment", completed: false, required: true },
    { id: "2", label: "Test all features in browser preview", category: "Pre-Deployment", completed: false, required: true },
    { id: "3", label: "Verify Supabase connection & edge functions", category: "Pre-Deployment", completed: false, required: true },
    { id: "4", label: "Check authentication flow works", category: "Pre-Deployment", completed: false, required: true },
    { id: "5", label: "Export to GitHub repository", category: "Pre-Deployment", completed: false, required: true },
    
    // Capacitor Setup
    { id: "6", label: "Update capacitor.config.ts with production URLs", category: "Capacitor Setup", completed: false, required: true },
    { id: "7", label: "Run npx cap add android", category: "Capacitor Setup", completed: false, required: true },
    { id: "8", label: "Run npx cap add ios", category: "Capacitor Setup", completed: false, required: true },
    { id: "9", label: "Run npx cap sync", category: "Capacitor Setup", completed: false, required: true },
    
    // App Assets
    { id: "10", label: "Add app icon (1024x1024)", category: "App Assets", completed: false, required: true },
    { id: "11", label: "Add splash screen images", category: "App Assets", completed: false, required: true },
    { id: "12", label: "Update app name in capacitor.config.ts", category: "App Assets", completed: false, required: true },
    
    // Android
    { id: "13", label: "Generate Android signing key", category: "Android Build", completed: false, required: true },
    { id: "14", label: "Update android/app/build.gradle", category: "Android Build", completed: false, required: true },
    { id: "15", label: "Test on Android emulator", category: "Android Build", completed: false, required: true },
    { id: "16", label: "Build release APK/AAB", category: "Android Build", completed: false, required: true },
    { id: "17", label: "Create Google Play Console account", category: "Android Build", completed: false, required: true },
    
    // iOS
    { id: "18", label: "Configure Apple Developer account", category: "iOS Build", completed: false, required: true },
    { id: "19", label: "Create App ID in Apple Developer Portal", category: "iOS Build", completed: false, required: true },
    { id: "20", label: "Configure signing certificates", category: "iOS Build", completed: false, required: true },
    { id: "21", label: "Test on iOS simulator", category: "iOS Build", completed: false, required: true },
    { id: "22", label: "Build for release", category: "iOS Build", completed: false, required: true },
    
    // Store Submission
    { id: "23", label: "Prepare app screenshots (both stores)", category: "Store Submission", completed: false, required: true },
    { id: "24", label: "Write app description & keywords", category: "Store Submission", completed: false, required: true },
    { id: "25", label: "Create privacy policy URL", category: "Store Submission", completed: false, required: true },
    { id: "26", label: "Submit to Google Play", category: "Store Submission", completed: false, required: false },
    { id: "27", label: "Submit to App Store", category: "Store Submission", completed: false, required: false },
  ]);

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const categories = Array.from(new Set(items.map(item => item.category)));
  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;
  const progress = Math.round((completedCount / totalCount) * 100);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            <CardTitle>Mobile App Launch Checklist</CardTitle>
          </div>
          <Badge variant={progress === 100 ? "default" : "secondary"}>
            {completedCount}/{totalCount} Complete
          </Badge>
        </div>
        <CardDescription>
          Track your progress deploying MixClub to mobile app stores
        </CardDescription>
        <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {categories.map(category => {
          const categoryItems = items.filter(item => item.category === category);
          const categoryCompleted = categoryItems.filter(item => item.completed).length;
          
          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  {categoryCompleted === categoryItems.length ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                  {category}
                </h4>
                <span className="text-xs text-muted-foreground">
                  {categoryCompleted}/{categoryItems.length}
                </span>
              </div>
              
              <div className="space-y-2 pl-6">
                {categoryItems.map(item => (
                  <div key={item.id} className="flex items-center gap-2">
                    <Checkbox 
                      id={item.id}
                      checked={item.completed}
                      onCheckedChange={() => toggleItem(item.id)}
                    />
                    <label 
                      htmlFor={item.id}
                      className="text-sm cursor-pointer flex-1 flex items-center gap-2"
                    >
                      {item.label}
                      {item.required && (
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
