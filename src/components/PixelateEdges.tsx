import { View } from "react-native";

type PixelatEdgesProps = {
  style?: string;
};

export default function PixelatEdges({
  style = "bg-black",
}: PixelatEdgesProps) {
  return (
    <View className="absolute inset-0 pointer-events-none">
      {/* Top */}
      <View className={`absolute size-1 top-0 left-0 right-0 ${style}`} />

      {/* Right */}
      <View className={`absolute size-1 top-0 right-0 bottom-0 ${style}`} />

      {/* Bottom */}
      <View className={`absolute size-1 bottom-0 left-0 right-0 ${style}`} />

      {/* Left */}
      <View className={`absolute size-1 bottom-0 right-0  ${style}`} />
    </View>
  );
}
