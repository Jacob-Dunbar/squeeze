import { View } from "react-native";

type RecoveryCountdownProps = {
  progress: number;
};

export default function RecoveryCountdown({
  progress,
}: RecoveryCountdownProps) {
  return (
    <View className="h-[2px] bg-primary/20">
      <View
        className="h-full bg-primary/40"
        style={{
          width: `${progress * 100}%`,
        }}
      ></View>
    </View>
  );
}
