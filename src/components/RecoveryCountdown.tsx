import { View } from "react-native";

type RecoveryCountdownProps = {
  progress: number;
};

export default function RecoveryCountdown({
  progress,
}: RecoveryCountdownProps) {
  return (
    <View className="pixel-bar">
      <View
        className="pixel-bar-fill opacity-60"
        style={{
          width: `${progress * 100}%`,
        }}
      >
        {/* <LinearGradient
          colors={["#41a715", "#bdb709"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{
            width: "100%",
            height: "100%",
          }}
        /> */}
      </View>
    </View>
  );
}
