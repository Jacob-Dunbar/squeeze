import { Image, View } from "react-native";

type ScreenBackgroundProps = {
  children: React.ReactNode;
};

export default function ScreenBackground({ children }: ScreenBackgroundProps) {
  return (
    <View className="relative flex-1 bg-black">
      {/* Background image */}
      <Image
        source={require("../../assets/images/cyber-armor.jpg")}
        resizeMode="cover"
        className="absolute inset-0 rotate-180 !w-screen !h-full opacity-40"
      />

      {/* Grey/dark overlay */}
      <View className="absolute inset-0 bg-black/60" />

      {/* Page content */}
      <View className="flex-1">{children}</View>
    </View>
  );
}
