import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type RepsSliderProps = {
  reps: number;
  targetReps: number;
  maxReps: number;
  onUpdateReps: (value: number) => void;
  onSubmitSet: () => void;
};

export default function RepsSlider({
  reps,
  targetReps,
  maxReps,
  onUpdateReps,
  onSubmitSet,
}: RepsSliderProps) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(reps));
  const containerRef = useRef<View>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const hasMoved = useRef(false);
  const startX = useRef(0);

  useEffect(() => {
    setInputValue(String(reps));
  }, [reps]);

  const updateFromPosition = (x: number) => {
    if (!containerWidth) return;

    const percentage = Math.max(0, Math.min(1, x / containerWidth));
    const value = Math.round(percentage * maxReps);

    onUpdateReps(Math.max(1, value));
  };

  const handleTouchStart = (event: any) => {
    startX.current = event.nativeEvent.locationX;
    hasMoved.current = false;
  };

  const handleTouchMove = (event: any) => {
    const currentX = event.nativeEvent.locationX;

    if (Math.abs(currentX - startX.current) > 5) {
      hasMoved.current = true;
    }

    updateFromPosition(currentX);
  };

  const handleTouchEnd = () => {
    if (!hasMoved.current) {
      onSubmitSet();
    }
  };

  const submitInput = () => {
    const value = Math.max(1, Math.min(maxReps, Number(inputValue) || 1));

    setInputValue(String(value));
    setEditing(false);
    onUpdateReps(value);
    Keyboard.dismiss();
  };

  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: -8,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <View className="flex-col flex-1 h-10 gap-3">
      <View className="flex flex-row justify-between">
        <View className="flex flex-row gap-2">
          {/* Numerical value */}
          {editing ? (
            <TextInput
              autoFocus
              value={inputValue}
              onChangeText={setInputValue}
              onSubmitEditing={submitInput}
              onBlur={submitInput}
              keyboardType="number-pad"
              className="w-10 text-2xl text-center text-primary pixel-heading"
              selectTextOnFocus
            />
          ) : (
            <TouchableOpacity onPress={() => setEditing(true)}>
              <Text className="text-2xl text-left w-18 text-primary pixel-heading">
                {reps}
              </Text>
            </TouchableOpacity>
          )}

          <Text className="text-2xl pixel-heading ">Reps</Text>
        </View>

        <Animated.View
          style={{
            transform: [{ translateX: slideAnim }],
          }}
        >
          <View className="flex-row items-center gap-2 mt-auto">
            <Text className="pixel-heading">slide and tap to log</Text>

            <Image
              className="opacity-60"
              source={require("../../assets/UI/slide.png")}
            />
          </View>
        </Animated.View>
      </View>

      {/* Segmented slider */}
      <View
        ref={containerRef}
        className="flex-row flex-1 h-10 gap-1"
        onLayout={(event) => {
          setContainerWidth(event.nativeEvent.layout.width);
        }}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={handleTouchStart}
        onResponderMove={handleTouchMove}
        onResponderRelease={handleTouchEnd}
      >
        {Array.from({ length: maxReps }).map((_, index) => {
          const active = index < reps;
          const target = index < targetReps;

          return (
            <View
              key={index}
              className={`flex-1 border-primary/60 border h-3 ${
                active
                  ? target
                    ? "bg-primary/60"
                    : "bg-secondary/80"
                  : index + 1 > targetReps
                    ? "!border-secondary/60"
                    : " "
              }`}
            />
          );
        })}
      </View>
    </View>
  );
}
