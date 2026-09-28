import { Pressable, View } from "react-native";
import Svg, { Polygon } from "react-native-svg";

export default function HexButton({
  children,
  onPress,
}: {
  children: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="relative" style={{ height: 56 }}>
      {/* Hexagon background */}
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 210 56"
        preserveAspectRatio="none"
        className="absolute"
      >
        <Polygon
          points="40,0 170,0 210,28 170,56 40,56 0,28"
          fill="rgba(255,255,255,0.1)"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="2"
        />
      </Svg>

      {/* Content */}
      <View className="flex-row items-center h-full gap-2 pl-3 pr-5">
        {children}
      </View>
    </Pressable>
  );
}
