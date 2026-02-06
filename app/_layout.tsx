// app/_layout.tsx
import { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import LoadingScreen from '../components/LoadingScreen';
import { database } from '../services/database';

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await database.initDatabase();
        // Delay simulasi agar loading screen terlihat elegan
        await new Promise(resolve => setTimeout(resolve, 3500)); 
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  if (!appIsReady) {
    return <LoadingScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Mengarahkan ke folder (tabs) */}
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}