import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Bell, Mic, Wifi, WifiOff, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TestResult {
  name: string;
  status: "idle" | "testing" | "pass" | "fail";
  message?: string;
}

export const MobileFeatureTester = () => {
  const { toast } = useToast();
  const [tests, setTests] = useState<TestResult[]>([
    { name: "Push Notifications", status: "idle" },
    { name: "Audio Recording", status: "idle" },
    { name: "Audio Playback", status: "idle" },
    { name: "Offline Mode", status: "idle" },
    { name: "Camera Access", status: "idle" },
  ]);

  const updateTest = (name: string, status: TestResult["status"], message?: string) => {
    setTests(prev => prev.map(t => t.name === name ? { ...t, status, message } : t));
  };

  const testPushNotifications = async () => {
    updateTest("Push Notifications", "testing");
    try {
      // Check if Notification API is supported
      if (!("Notification" in window)) {
        throw new Error("Notifications not supported");
      }

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Permission denied");
      }

      // Test notification
      new Notification("Mixxclub Test", {
        body: "Push notifications are working!",
        icon: "/icon.png",
      });

      updateTest("Push Notifications", "pass", "Permission granted, test sent");
      toast({ title: "Push notifications working!" });
    } catch (error) {
      updateTest("Push Notifications", "fail", error.message);
      toast({ title: "Push notification test failed", variant: "destructive" });
    }
  };

  const testAudioRecording = async () => {
    updateTest("Audio Recording", "testing");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create a simple recording test
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        updateTest("Audio Recording", "pass", `Recorded ${blob.size} bytes`);
        toast({ title: "Audio recording working!" });
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), 2000); // Record for 2 seconds
    } catch (error) {
      updateTest("Audio Recording", "fail", error.message);
      toast({ title: "Audio recording test failed", variant: "destructive" });
    }
  };

  const testAudioPlayback = async () => {
    updateTest("Audio Playback", "testing");
    try {
      // Create a simple beep sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 440; // A4 note
      gainNode.gain.value = 0.3;

      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        updateTest("Audio Playback", "pass", "Test tone played");
        toast({ title: "Audio playback working!" });
      }, 500);
    } catch (error) {
      updateTest("Audio Playback", "fail", error.message);
      toast({ title: "Audio playback test failed", variant: "destructive" });
    }
  };

  const testOfflineMode = async () => {
    updateTest("Offline Mode", "testing");
    try {
      // Check if service worker is registered
      if (!('serviceWorker' in navigator)) {
        throw new Error("Service Worker not supported");
      }

      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        throw new Error("No service worker registered");
      }

      // Test cache API
      const cache = await caches.open('mixclub-v1');
      await cache.add('/');
      
      updateTest("Offline Mode", "pass", "Service Worker & Cache API working");
      toast({ title: "Offline mode ready!" });
    } catch (error) {
      updateTest("Offline Mode", "fail", error.message);
      toast({ title: "Offline mode test failed", variant: "destructive" });
    }
  };

  const testCameraAccess = async () => {
    updateTest("Camera Access", "testing");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      updateTest("Camera Access", "pass", "Camera permission granted");
      toast({ title: "Camera access working!" });
    } catch (error) {
      updateTest("Camera Access", "fail", error.message);
      toast({ title: "Camera access test failed", variant: "destructive" });
    }
  };

  const runAllTests = async () => {
    await testPushNotifications();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testAudioRecording();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testAudioPlayback();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testOfflineMode();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await testCameraAccess();
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "testing":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "pass":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "fail":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "testing":
        return <Badge variant="secondary">Testing...</Badge>;
      case "pass":
        return <Badge variant="default">Pass</Badge>;
      case "fail":
        return <Badge variant="destructive">Fail</Badge>;
      default:
        return <Badge variant="outline">Not Run</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            <CardTitle>Mobile Feature Testing</CardTitle>
          </div>
          <Button onClick={runAllTests} size="sm">
            Run All Tests
          </Button>
        </div>
        <CardDescription>
          Test native mobile capabilities before deployment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {tests.map((test) => (
          <div key={test.name} className="flex items-center justify-between p-3 rounded border">
            <div className="flex items-center gap-3 flex-1">
              {getStatusIcon(test.status)}
              <div className="flex-1">
                <div className="font-medium text-sm">{test.name}</div>
                {test.message && (
                  <div className="text-xs text-muted-foreground mt-1">{test.message}</div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(test.status)}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  switch (test.name) {
                    case "Push Notifications":
                      testPushNotifications();
                      break;
                    case "Audio Recording":
                      testAudioRecording();
                      break;
                    case "Audio Playback":
                      testAudioPlayback();
                      break;
                    case "Offline Mode":
                      testOfflineMode();
                      break;
                    case "Camera Access":
                      testCameraAccess();
                      break;
                  }
                }}
              >
                Test
              </Button>
            </div>
          </div>
        ))}

        <div className="pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            <p className="font-semibold mb-2">Testing Notes:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Push notifications require HTTPS or localhost</li>
              <li>Audio recording requires microphone permission</li>
              <li>Camera access requires camera permission</li>
              <li>Service Worker must be registered for offline mode</li>
              <li>Test on actual mobile device for best results</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
