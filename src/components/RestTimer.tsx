import { useEffect, useState } from "react";
import { AppState, Text, View } from "react-native";

type RestTimerProps = {
  rest: number;
  // Epoch ms timestamp of when the current rest period started, or 0 if not started yet.
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
    if (restStarted === 0 || rest <= 0) {
      setRemaining(rest);
      return;
    }

    // Recompute from the wall-clock start time so the countdown stays correct
    // even if the app was backgrounded and this interval was suspended.
    const tick = () => {
      const elapsed = Math.floor((Date.now() - restStarted) / 1000);
      setRemaining(Math.max(0, rest - elapsed));
    };

    tick();

    const interval = setInterval(tick, 1000);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") tick();
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
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
