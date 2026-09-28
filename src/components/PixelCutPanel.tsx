import { View, ViewProps } from "react-native";

type PixelCutPanelProps = ViewProps & {
  children: React.ReactNode;
  cutSize?: number;
};

export default function PixelCutPanel({
  children,
  cutSize = 8,
  style,
  ...props
}: PixelCutPanelProps) {
  return (
    <View
      style={[
        {
          position: "relative",
          backgroundColor: "#171717",
          borderWidth: 2,
          borderColor: "rgba(255,255,255,0.8)",
        },
        style,
      ]}
      {...props}
    >
      {/* Top-left cut */}
      <View
        style={{
          position: "absolute",
          top: -2,
          left: -2,
          width: cutSize,
          height: cutSize,
          backgroundColor: "#000",
        }}
      />

      {/* Top-right cut */}
      <View
        style={{
          position: "absolute",
          top: -2,
          right: -2,
          width: cutSize,
          height: cutSize,
          backgroundColor: "#000",
        }}
      />

      {/* Bottom-left cut */}
      <View
        style={{
          position: "absolute",
          bottom: -2,
          left: -2,
          width: cutSize,
          height: cutSize,
          backgroundColor: "#000",
        }}
      />

      {/* Bottom-right cut */}
      <View
        style={{
          position: "absolute",
          bottom: -2,
          right: -2,
          width: cutSize,
          height: cutSize,
          backgroundColor: "#000",
        }}
      />

      {children}
    </View>
  );
}
