import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import RepsSlider from "../components/RepSlider";

import SetBadge from "./setBadge";

type SetLoggerProps = {
  sets: number;
  targetReps: number;
  reps: string[];
  lastWeekReps: number[];
  submittedSets: number;
  badgeAnimation: { setIndex: number; id: number } | null;
  onUpdateReps: (setIndex: number, value: string) => void;
  onEditSet: (setIndex: number) => void;
  onBadgeAnimationStart: (id: number) => void;
  onSubmitSet: () => void;
};

export default function SetLogger({
  sets,
  targetReps,
  reps,
  lastWeekReps,
  submittedSets,
  badgeAnimation,
  onUpdateReps,
  onEditSet,
  onBadgeAnimationStart,
  onSubmitSet,
}: SetLoggerProps) {
  const currentSetIndex = submittedSets;
  const currentReps = Number(reps[currentSetIndex] ?? 0);
  const [currentSetPanelHeight, setCurrentSetPanelHeight] = useState(0);
  const [preserveFinalPanel, setPreserveFinalPanel] = useState(false);

  return (
    <View className="flex flex-col gap-4 p-4">
      {/* Completed sets */}
      {submittedSets > 0 && (
        <View className="flex flex-col gap-2">
          {Array.from({ length: submittedSets }).map((_, setIndex) => {
            const completedReps = Number(reps[setIndex] ?? 0);
            const previousReps = lastWeekReps[setIndex] ?? 0;

            const hitTarget = completedReps === targetReps;
            const exceededTarget = completedReps > targetReps;

            const improved = completedReps > previousReps;
            const declined = completedReps < previousReps;
            const same = completedReps === previousReps;

            return (
              <Pressable
                key={setIndex}
                accessibilityRole="button"
                accessibilityLabel={`Edit set ${setIndex + 1}`}
                onPress={() => {
                  setPreserveFinalPanel(false);
                  onEditSet(setIndex);
                }}
                className="flex flex-row items-center h-12 gap-5 px-4 border rounded-lg border-white/10 bg-black/10"
              >
                <View className="flex justify-center flex-1">
                  <View className="flex flex-row items-center justify-between gap-2">
                    <View className="flex flex-row items-center gap-5">
                      <Text className="font-liberation text-lightText">
                        {setIndex + 1}
                      </Text>

                      <Text className="text-lg tracking-wider text-white font-grotesk">
                        {completedReps}
                        <span className="text-xs uppercase text-lightText">
                          {" "}
                          Reps
                        </span>
                      </Text>
                    </View>

                    <View className="w-[90px] h-5 items-end justify-center">
                      {(hitTarget || exceededTarget) && (
                        <SetBadge
                          message={hitTarget ? "Target hit" : "Limit break"}
                          shouldAnimate={badgeAnimation?.setIndex === setIndex}
                          onAnimationStart={() => {
                            if (badgeAnimation?.setIndex === setIndex) {
                              onBadgeAnimationStart(badgeAnimation.id);
                            }
                          }}
                          onAnimationComplete={() => {
                            if (badgeAnimation?.setIndex === setIndex) {
                              setPreserveFinalPanel(false);
                            }
                          }}
                        />
                      )}

                      {!hitTarget && !exceededTarget && (
                        <>
                          {improved && (
                            <Text className="px-2 ml-auto text-primary/60">
                              ▲
                            </Text>
                          )}

                          {declined && (
                            <Text className="px-2 ml-auto text-red-500/50">
                              ▼
                            </Text>
                          )}
                        </>
                      )}
                    </View>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Current set */}
      {currentSetIndex < sets && (
        <View
          className="flex flex-col gap-2 p-4 mb-2 border-2 rounded-2xl bg-black/30 border-primary"
          onLayout={(event) =>
            setCurrentSetPanelHeight(event.nativeEvent.layout.height)
          }
        >
          <Text className="flex items-center justify-center mr-auto text-sm text-black rounded size-7 bg-primary font-liberation">
            {currentSetIndex + 1}
          </Text>

          <RepsSlider
            reps={Number(reps[currentSetIndex] ?? 0)}
            targetReps={targetReps}
            onSubmitSet={() => {
              if (currentSetIndex === sets - 1 && currentReps >= targetReps) {
                setPreserveFinalPanel(true);
              }
              onSubmitSet();
            }}
            maxReps={targetReps + 2}
            onUpdateReps={(value) =>
              onUpdateReps(currentSetIndex, String(value))
            }
          />
        </View>
      )}

      {currentSetIndex === sets && preserveFinalPanel && (
        <View style={{ height: currentSetPanelHeight }} />
      )}

      {/* future sets */}

      {Array.from({ length: Math.max(0, sets - currentSetIndex - 1) }).map(
        (_, index) => {
          const setNumber = currentSetIndex + index + 2;

          return (
            <View
              key={setNumber}
              className="flex flex-row gap-5 px-4 py-2 rounded-lg bg-black/10"
            >
              <View className="flex flex-col flex-1 gap-1">
                <View className="flex flex-row justify-between gap-2">
                  <View className="flex flex-row items-center gap-5">
                    <Text className="font-liberation text-lightText/50">
                      {setNumber}
                    </Text>
                    <Text className="tracking-wider text-white/30 font-grotesk">
                      —
                    </Text>
                  </View>
                  <View className="w-[45px]" />
                </View>
              </View>
            </View>
          );
        },
      )}
    </View>
  );
}
