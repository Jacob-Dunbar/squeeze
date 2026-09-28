import { StyleSheet, Text, View } from "react-native";

type RecoveryProgressProps = {
  countdown: string;
  progress: number;
};

export default function RecoveryProgress({
  countdown,
  progress,
}: RecoveryProgressProps) {
  return (
    <View style={styles.recovery}>
      <Text style={styles.countdown}>{countdown}</Text>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progress,
            {
              width: `${progress * 100}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  recovery: {
    gap: 8,
  },

  countdown: {
    fontSize: 20,
    fontWeight: "bold",
  },

  progressBar: {
    height: 8,
    backgroundColor: "#e5e5e5",
    borderRadius: 4,
    overflow: "hidden",
  },

  progress: {
    height: "100%",
    backgroundColor: "#000",
    borderRadius: 4,
  },
});
