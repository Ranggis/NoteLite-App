// app/index.tsx
import { Redirect } from 'expo-router';

export default function RootIndex() {
  // Langsung pindahkan user ke /(tabs)/index
  return <Redirect href="/(tabs)" />;
}