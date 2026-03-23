import { ExpoConfig, ConfigContext } from 'expo/config';

const APP_ENV = process.env.APP_ENV ?? 'development';

const envConfig = {
  development: {
    name: 'RawEval Chat (Dev)',
    bundleId: 'com.raweval.chat.dev',
    scheme: 'raweval-dev',
  },
  staging: {
    name: 'RawEval Chat (Staging)',
    bundleId: 'com.raweval.chat.staging',
    scheme: 'raweval-staging',
  },
  production: {
    name: 'RawEval Chat',
    bundleId: 'com.raweval.chat',
    scheme: 'raweval',
  },
}[APP_ENV] ?? {
  name: 'RawEval Chat (Dev)',
  bundleId: 'com.raweval.chat.dev',
  scheme: 'raweval-dev',
};

const EAS_PROJECT_ID = '9b80e049-4e57-4848-acf0-1ed788f7984a';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: envConfig.name,
  slug: 'raweval-chat',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: envConfig.scheme,
  userInterfaceStyle: 'dark',
  // @ts-expect-error — newArchEnabled is valid in Expo SDK 55 but not in the type definition
  newArchEnabled: true,

  // EAS Update
  updates: {
    url: `https://u.expo.dev/${EAS_PROJECT_ID}`,
  },
  runtimeVersion: {
    policy: 'appVersion',
  },

  splash: {
    image: './assets/images/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#0A0A0B',
  },

  ios: {
    supportsTablet: true,
    bundleIdentifier: envConfig.bundleId,
    infoPlist: {
      NSCameraUsageDescription: 'RawEval needs camera access to take photos for chat attachments.',
      NSPhotoLibraryUsageDescription: 'RawEval needs photo library access to attach images to chats.',
      NSMicrophoneUsageDescription: 'RawEval needs microphone access for voice input.',
      ITSAppUsesNonExemptEncryption: false,
    },
  },

  android: {
    package: envConfig.bundleId,
    softwareKeyboardLayoutMode: 'resize',
    adaptiveIcon: {
      backgroundColor: '#0A0A0B',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
  },

  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },

  plugins: [
    'expo-router',
    'expo-secure-store',
    './plugins/withRazorpay',
    './plugins/withGradle8',
    [
      'expo-font',
      {
        fonts: [
          './assets/fonts/DMMono-Regular.ttf',
          './assets/fonts/DMMono-Medium.ttf',
          './assets/fonts/InstrumentSerif-Regular.ttf',
          './assets/fonts/InstrumentSerif-Italic.ttf',
        ],
      },
    ],
  ],

  experiments: {
    typedRoutes: true,
  },

  extra: {
    eas: {
      projectId: EAS_PROJECT_ID,
    },
    appEnv: APP_ENV,
  },

  owner: 'raweval',
});
