import { useEffect, useState } from "react";
import { Text, View } from "react-native";

type RestDiamondProps = {
  rest: number;
  restStarted: number;
  onFinishedChange: (finished: boolean) => void;
};

export default function RestDiamond({
  rest,
  restStarted,
  onFinishedChange,
}: RestDiamondProps) {
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

  return (
    <View className="flex flex-col items-center gap-2">
      <Text className={`text-2xl font-liberation text-white`}>{remaining}</Text>
      <Text className="text-xs uppercase text-lightText font-liberation">
        seconds
      </Text>
    </View>
  );
}
