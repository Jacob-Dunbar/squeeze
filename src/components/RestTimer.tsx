import { useEffect, useState } from "react";
import { Text, View } from "react-native";

type RestTimerProps = {
  rest: number;
  restStarted: number;
  onFinishedChange: (finished: boolean) => void;
};

export default function RestTimer({
  rest,
  restStarted,
  onFinishedChange,
}: RestTimerProps) {
  const [remaining, setRemaining] = useState(rest);

  useEffect(() => {
    // Before the first set is logged, just show the full rest time.
    if (restStarted === 0) {
      setRemaining(rest);
      return;
    }

    // Every time a new set is logged, reset the timer.
    setRemaining(rest);

    if (rest <= 0) return;

    const interval = setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          clearInterval(interval);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [restStarted, rest]);

  const finished = remaining === 0;

  useEffect(() => {
    onFinishedChange(finished);
  }, [finished, onFinishedChange]);

  const formattedRemaining = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;

  return (
    <View className="flex flex-row items-center gap-2">
      <Text
        className={`font-liberation ${finished ? "text-lg" : "text-2xl"} ${
          finished || remaining > 10 ? "text-primary" : "text-tertiary"
        }`}
      >
        {finished ? "READY" : formattedRemaining}
      </Text>
    </View>
  );
}
