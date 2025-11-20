import { Stack } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';


export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <Stack screenOptions={{ headerShown: false }}>
      {/* Auth Stack */}
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />

      {/* Drawer which contains Sidebar + Tabs */}
      <Stack.Screen name="(drawer)" options={{ headerShown: false }} />

      {/* Modal */}
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
    </Stack>
    </GestureHandlerRootView>
  );
}
