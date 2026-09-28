import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useEffect, useRef, useState } from "react";
import { colors } from "../constants/colors";

import {
  Animated,
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
  const [showTapToLog, setShowTapToLog] = useState(false);
  const tapOverlayOpacity = useRef(new Animated.Value(0)).current;
  const containerRef = useRef<View>(null);
  const tapHintTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const hasMoved = useRef(false);
  const startX = useRef(0);

  useEffect(() => {
    setInputValue(String(reps));
  }, [reps]);

  useEffect(() => {
    return () => {
      if (tapHintTimeout.current) {
        clearTimeout(tapHintTimeout.current);
      }
    };
  }, []);

  const updateFromPosition = (x: number) => {
    if (!containerWidth) return;

    const percentage = Math.max(0, Math.min(1, x / containerWidth));
    const value = Math.round(percentage * maxReps);

    onUpdateReps(Math.max(1, value));
  };

  const handleTouchStart = (event: any) => {
    if (tapHintTimeout.current) {
      clearTimeout(tapHintTimeout.current);
      tapHintTimeout.current = null;
    }
    tapOverlayOpacity.stopAnimation();
    tapOverlayOpacity.setValue(0);
    setShowTapToLog(false);
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
      if (tapHintTimeout.current) {
        clearTimeout(tapHintTimeout.current);
        tapHintTimeout.current = null;
      }
      tapOverlayOpacity.stopAnimation();
      tapOverlayOpacity.setValue(0);
      setShowTapToLog(false);
      onSubmitSet();
      return;
    }

    tapHintTimeout.current = setTimeout(() => {
      setShowTapToLog(true);
      Animated.timing(tapOverlayOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
      tapHintTimeout.current = null;
    }, 2000);
  };

  const submitInput = () => {
    const value = Math.max(1, Math.min(maxReps, Number(inputValue) || 1));

    setInputValue(String(value));
    setEditing(false);
    onUpdateReps(value);
    Keyboard.dismiss();
  };

  const slideAnim = useRef(new Animated.Value(0)).current;
  const hintOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (reps > 0 || containerWidth === 0) {
      slideAnim.stopAnimation();
      hintOpacity.stopAnimation();
      slideAnim.setValue(0);
      hintOpacity.setValue(0.8);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: Math.max(0, containerWidth - 36),
            duration: 2700,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(2025),
            Animated.timing(hintOpacity, {
              toValue: 0,
              duration: 675,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(hintOpacity, {
          toValue: 0.8,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [reps, containerWidth, slideAnim, hintOpacity]);

  return (
    <View className="flex-col flex-1 h-10 gap-3">
      <View className="flex flex-row justify-center">
        <View className="flex flex-row items-end justify-end gap-2">
          {/* Numerical value */}
          {editing ? (
            <TextInput
              autoFocus
              value={inputValue}
              onChangeText={setInputValue}
              onSubmitEditing={submitInput}
              onBlur={submitInput}
              keyboardType="number-pad"
              className="w-10 text-2xl text-center text-white font-grotesk-bold"
              selectTextOnFocus
            />
          ) : (
            <TouchableOpacity onPress={() => setEditing(true)}>
              <Text className="text-left text-white text-7xl w-18 font-grotesk-bold">
                {reps}
              </Text>
            </TouchableOpacity>
          )}

          <Text className="mb-1 text-2xl tracking-wider uppercase font-liberation text-primary ">
            Reps
          </Text>
        </View>
      </View>

      <View className="flex flex-row justify-center gap-2">
        <FontAwesomeIcon icon="sliders" color={colors.primary} size={14} />
        <Text className="mb-1 text-xs tracking-wide uppercase font-liberation text-lightText ">
          SLIDE TO ADJUST • TAP TRACK TO LOG
          {}
        </Text>
      </View>

      {/* Segmented slider */}
      <View
        ref={containerRef}
        className="relative flex-row w-full overflow-hidden rounded-lg bg-white/5"
        style={{ height: 64 }}
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
          const repNumber = index + 1;

          return (
            <View
              key={index}
              className={`flex-1 h-full ${
                active && index === reps - 1
                  ? "border-r-[4px] border-primary"
                  : ""
              } ${
                active
                  ? repNumber < targetReps
                    ? "bg-primary/40"
                    : repNumber === targetReps
                      ? "bg-primary/60"
                      : "bg-primary"
                  : ""
              }`}
            />
          );
        })}
        {showTapToLog && (
          <Animated.View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0, 0, 0, 0.60)",
              opacity: tapOverlayOpacity,
              zIndex: 1,
            }}
          >
            <View className="flex-row items-center gap-3">
              <FontAwesomeIcon
                icon="hand-pointer"
                color={colors.primary}
                size={18}
              />
              <Text className="tracking-widest text-center text-white uppercase font-liberation">
                Tap to log
              </Text>
            </View>
          </Animated.View>
        )}
        {reps === 0 && containerWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: 8,
              top: 20,
              opacity: hintOpacity,
              transform: [{ translateX: slideAnim }],
            }}
          >
            <FontAwesomeIcon
              icon="angles-right"
              color={colors.primary}
              size={24}
            />
          </Animated.View>
        )}
      </View>
    </View>
  );
}
