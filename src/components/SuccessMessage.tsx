import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";

type SuccessMessageProps = {
  message: {
    text: string;
    id: number;
  } | null;
  duration?: number;
};

export default function SuccessMessage({
  message,
  duration = 2000,
}: SuccessMessageProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!message) {
      return;
    }

    opacity.setValue(0);

    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(duration),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [message]);

  if (!message) {
    return null;
  }

  return (
    <Animated.View pointerEvents="none" style={[styles.container, { opacity }]}>
      <Text style={styles.message}>{message.text}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: "50%",
    left: 20,
    right: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  message: {
    backgroundColor: "#000",
    color: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    fontSize: 18,
    fontWeight: "bold",
  },
});
