import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Modal, Text, View } from "react-native";

type SetBadgeProps = {
  message: string;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const LARGE_SIZE = 220;

const ANIMATION_FONT_SIZE = 32;
const FINAL_FONT_SIZE = 12;

const FINAL_SCALE = FINAL_FONT_SIZE / ANIMATION_FONT_SIZE;

export default function SetBadge({ message }: SetBadgeProps) {
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
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
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
        className="ml-auto w-[45px] h-[20px] items-center justify-center"
      >
        {completed && (
          <Text
            className="text-white pixel-heading"
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
                  <Text
                    className="text-white pixel-heading"
                    style={{
                      fontSize: ANIMATION_FONT_SIZE,
                    }}
                  >
                    {message}
                  </Text>
                </View>
              </Animated.View>
            </Animated.View>
          )}
        </View>
      </Modal>
    </>
  );
}
