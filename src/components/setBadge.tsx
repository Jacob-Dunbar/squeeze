import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Modal, Text, View } from "react-native";

type SetBadgeProps = {
  targetExceeded: boolean;
  shouldAnimate?: boolean;
  onAnimationStart?: () => void;
  onAnimationComplete?: () => void;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const LARGE_SIZE = 220;
const ANIMATED_BADGE_WIDTH = 200;
const ANIMATED_BADGE_HEIGHT = 44;
const FINAL_BADGE_WIDTH = 90;
const FINAL_BADGE_HEIGHT = 20;

const ANIMATION_FONT_SIZE = 26;
const FINAL_FONT_SIZE = 12;

const FINAL_SCALE = FINAL_BADGE_WIDTH / ANIMATED_BADGE_WIDTH;

export default function SetBadge({
  targetExceeded,
  shouldAnimate = false,
  onAnimationStart,
  onAnimationComplete,
}: SetBadgeProps) {
  const message = targetExceeded ? "Overpowered" : "Target hit";
  const badgeColors = targetExceeded
    ? "border-secondary/70 bg-secondary/20"
    : "border-primary/50 bg-primary/20";
  const badgeTextColor = targetExceeded ? "text-secondary" : "text-primary";

  const targetRef = useRef<View>(null);

  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const wipeWidth = useRef(new Animated.Value(0)).current;

  const [target, setTarget] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const [animating, setAnimating] = useState(false);
  const [completed, setCompleted] = useState(!shouldAnimate);

  useEffect(() => {
    if (!shouldAnimate) {
      setCompleted(true);
      return;
    }

    onAnimationStart?.();

    requestAnimationFrame(() => {
      targetRef.current?.measureInWindow((x, y, width, height) => {
        const targetCenterX = x + width / 2;
        const targetCenterY = y + height / 2;

        setTarget({
          x: targetCenterX,
          y: targetCenterY,
        });

        // Start at the centre of the screen
        translateX.setValue(SCREEN_WIDTH / 2 - targetCenterX);
        translateY.setValue(SCREEN_HEIGHT / 2 - targetCenterY);

        setAnimating(true);

        Animated.sequence([
          // Wipe in
          Animated.timing(wipeWidth, {
            toValue: LARGE_SIZE,
            duration: 450,
            useNativeDriver: false,
          }),

          // Hold
          Animated.delay(500),

          // Shrink + move to target
          Animated.parallel([
            Animated.timing(scale, {
              toValue: FINAL_SCALE,
              duration: 500,
              useNativeDriver: true,
            }),

            Animated.timing(translateX, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),

            Animated.timing(translateY, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
        ]).start(({ finished }) => {
          if (finished) {
            setAnimating(false);
            setCompleted(true);
            onAnimationComplete?.();
          }
        });
      });
    });
  }, []);

  return (
    <>
      {/* Actual destination */}
      <View
        ref={targetRef}
        collapsable={false}
        className={`ml-auto items-center justify-center rounded-md border px-1 ${
          completed ? badgeColors : "border-transparent bg-transparent"
        }`}
        style={{ width: FINAL_BADGE_WIDTH, height: FINAL_BADGE_HEIGHT }}
      >
        {completed && (
          <Text
            className={`w-full text-center uppercase font-liberation ${badgeTextColor}`}
            numberOfLines={1}
            adjustsFontSizeToFit
            style={{
              fontSize: FINAL_FONT_SIZE,
            }}
          >
            {message}
          </Text>
        )}
      </View>

      {/* Animation layer */}
      <Modal
        transparent
        visible={animating}
        animationType="none"
        statusBarTranslucent
      >
        <View
          className="flex-1 !bg-black/20 backdrop-blur-sm"
          pointerEvents="none"
        >
          {target && (
            <Animated.View
              className="absolute items-center justify-center"
              style={{
                left: target.x - LARGE_SIZE / 2,
                top: target.y - LARGE_SIZE / 2,
                width: LARGE_SIZE,
                height: LARGE_SIZE,
                transform: [{ translateX }, { translateY }, { scale }],
              }}
            >
              {/* Wipe container */}
              <Animated.View
                className="absolute left-0 top-0 h-[220px] overflow-hidden"
                style={{
                  width: wipeWidth,
                }}
              >
                {/* Fixed animation canvas */}
                <View
                  style={{
                    width: LARGE_SIZE,
                    height: LARGE_SIZE,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <View className="bg-background">
                    <View
                      className={`items-center justify-center rounded-lg border-2 px-2 ${badgeColors}`}
                      style={{
                        width: ANIMATED_BADGE_WIDTH,
                        height: ANIMATED_BADGE_HEIGHT,
                      }}
                    >
                      <Text
                        className={`w-full text-center uppercase font-liberation ${badgeTextColor}`}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        style={{
                          fontSize: ANIMATION_FONT_SIZE,
                        }}
                      >
                        {message}
                      </Text>
                    </View>
                  </View>
                </View>
              </Animated.View>
            </Animated.View>
          )}
        </View>
      </Modal>
    </>
  );
}
