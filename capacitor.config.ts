import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.ee0645d0cc4e4e26b5ebb018162f6a50',
  appName: 'MixClub',
  webDir: 'dist',
  server: {
    url: 'https://ee0645d0-cc4e-4e26-b5eb-b018162f6a50.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0A0A0A',
      showSpinner: false
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;
