import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import Svg, { Polygon } from "react-native-svg";

type RestDiamondProps = {
  rest: number;
  restStarted: number;
};

export default function RestDiamond({ rest, restStarted }: RestDiamondProps) {
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

  return (
    <View className="items-center gap-2">
      <Text className="text-[10px] pixel-label">rest</Text>

      <View className="relative h-[76px] w-[76px] items-center justify-center">
        <Svg width={76} height={76} viewBox="0 0 76 76" className="absolute">
          <Polygon
            points="38,2 74,38 38,74 2,38"
            fill={finished ? "#FFFFFF" : "#181818"}
            stroke={finished ? "#FFFFFF" : "#444444"}
            strokeWidth={2}
          />
        </Svg>

        <Text
          className={`text-xl pixel-heading ${
            finished ? "text-black" : "text-white"
          }`}
        >
          {remaining}
        </Text>
      </View>

      <Text className="text-[10px] text-center pixel-label">seconds</Text>
    </View>
  );
}
