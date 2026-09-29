import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
  useFonts,
} from "@expo-google-fonts/space-grotesk";

import { Stack } from "expo-router";
import { View } from "react-native";

import "../../global.css";
import "../fontawesome";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    LiberationMono: require("../../assets/fonts/LiberationMono-Regular.ttf"),
    LiberationMonoBold: require("../../assets/fonts/LiberationMono-Bold.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View className="flex-1 bg-black">
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="details" />
      </Stack>
    </View>
  );
}
