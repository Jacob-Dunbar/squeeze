import { Image, Text, View } from "react-native";
import RepsSlider from "../components/RepSlider";
import SetBadge from "./setBadge";

type SetLoggerProps = {
  sets: number;
  targetReps: number;
  reps: string[];
  lastWeekReps: number[];
  submittedSets: number;
  onUpdateReps: (setIndex: number, value: string) => void;
  onSubmitSet: () => void;
};

export default function SetLogger({
  sets,
  targetReps,
  reps,
  lastWeekReps,
  submittedSets,
  onUpdateReps,
  onSubmitSet,
}: SetLoggerProps) {
  const currentSetIndex = submittedSets;
  const currentReps = Number(reps[currentSetIndex] ?? 0);

  return (
    <View className="flex flex-col gap-10">
      {/* Completed sets */}
      {submittedSets > 0 && (
        <View className="flex flex-col gap-4">
          {Array.from({ length: submittedSets }).map((_, setIndex) => {
            const completedReps = Number(reps[setIndex] ?? 0);
            const previousReps = lastWeekReps[setIndex] ?? 0;

            const hitTarget = completedReps === targetReps;
            const exceededTarget = completedReps > targetReps;

            const improved = completedReps > previousReps;
            const declined = completedReps < previousReps;
            const same = completedReps === previousReps;

            return (
              <View key={setIndex} className="flex flex-row gap-5">
                <View className="flex flex-col flex-1 gap-1">
                  <View className="flex flex-row justify-between gap-2">
                    <View className="flex flex-col ">
                      <Text className="pixel-label">Set {setIndex + 1}</Text>

                      <Text className="text-2xl text-left text-primary/60 pixel-heading">
                        {completedReps} Reps
                      </Text>
                    </View>

                    <View className="mt-auto mb-2">
                      {hitTarget && <SetBadge message="perfect" />}

                      {exceededTarget && <SetBadge message="Maxxed" />}

                      {!hitTarget && !exceededTarget && (
                        <>
                          {improved && (
                            <View className="w-[45px]">
                              <Image
                                className="ml-auto mr-1 opacity-80"
                                source={require("../../assets/UI/up.png")}
                              />
                            </View>
                          )}

                          {declined && (
                            <View className="w-[45px]">
                              <Image
                                className="ml-auto mr-1 rotate-180 opacity-60"
                                source={require("../../assets/UI/up.png")}
                              />
                            </View>
                          )}

                          {same && (
                            <Text className="px-2 ml-auto text-xl text-primary/60 pixel-heading">
                              Good
                            </Text>
                          )}
                        </>
                      )}
                    </View>
                  </View>

                  <View className="flex flex-row items-center justify-start w-full gap-4">
                    <View className="flex-row flex-1 h-3 gap-1">
                      {Array.from({ length: targetReps + 2 }).map(
                        (_, index) => (
                          <View
                            key={index}
                            className={`flex-1 h-full border ${
                              completedReps > index
                                ? index < targetReps
                                  ? "bg-primary/50"
                                  : "bg-secondary/50 "
                                : index + 1 > targetReps
                                  ? "border-secondary/60"
                                  : " border-primary/60"
                            }`}
                          />
                        ),
                      )}
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Current set */}
      {currentSetIndex < sets && (
        <View className="flex flex-col gap-2">
          <Text className="text-sm text-primary pixel-label">
            Set {currentSetIndex + 1}
          </Text>

          <RepsSlider
            reps={Number(reps[currentSetIndex] ?? 0)}
            // targetReps={targetReps}
            targetReps={5}
            onSubmitSet={onSubmitSet}
            // maxReps={targetReps + 2}
            maxReps={5 + 2}
            onUpdateReps={(value) =>
              onUpdateReps(currentSetIndex, String(value))
            }
          />

          {/* <Pressable className="pixel-button" onPress={onSubmitSet}>
            <View className="absolute top-0 left-0 bg-black size-1"></View>
              <View className="absolute bottom-0 left-0 bg-black size-1"></View>
              <View className="absolute top-0 right-0 bg-black size-1"></View>
              <View className="absolute bottom-0 right-0 bg-black size-1"></View>
            <Image
              className="!size-[40px] opacity-80"
              source={require("../../assets/UI/up_button.png")}
            />

            <Text className="text-lg text-black pixel-heading">Log Set</Text>
          </Pressable> */}
        </View>
      )}
    </View>
  );
}
