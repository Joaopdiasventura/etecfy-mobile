import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'EtecFy',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      showSpinner: false,
      backgroundColor: '#0b0b0c',
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
