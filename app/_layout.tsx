// app/_layout.js
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

// Prevent splash screen auto-hide before loading assets
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    RubikItalic: require('../assets/fonts/Rubik-Italic.ttf'),
    RubikRegular: require('../assets/fonts/Rubik-Regular.ttf'),
    RubikBold: require('../assets/fonts/Rubik-Bold.ttf'),
    RubikSemiBold: require('../assets/fonts/Rubik-SemiBold.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack initialRouteName="index">
        {/* Initial Home Screen without Tabs */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        
        {/* Tabbed Section - Shows Bottom Tab Navigator */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        

      </Stack>
    </ThemeProvider>
  );
}
