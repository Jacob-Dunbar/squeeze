import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Pressable, ScrollView, Text, View } from "react-native";
import { colors } from "../constants/colors";
import type { Exercise } from "../types/workout";

type ExerciseSelectorProps = {
  exercises: Exercise[];
  activeIndex: number;
  submittedSets: number[];
  onSelect: (index: number) => void;
};

export default function ExerciseSelector({
  exercises,
  activeIndex,
  submittedSets,
  onSelect,
}: ExerciseSelectorProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="flex-grow-0 w-full px-5"
      contentContainerClassName="gap-2 px-1"
    >
      {exercises.map((exercise, index) => {
        const isActive = index === activeIndex;
        const isComplete = (submittedSets[index] ?? 0) >= exercise.sets;

        return (
          <Pressable
            key={exercise.id + index}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={() => onSelect(index)}
            className={` rounded-lg shrink-0 justify-center border-2 px-3 py-2 ${
              isActive
                ? "border-primary bg-primary"
                : isComplete
                  ? " bg-primary/40"
                  : "border-transparent bg-[#262A34]/70"
            }`}
          >
            <View className="flex-row items-center gap-2">
              <Text
                className={`uppercase font-liberation ${isActive || isComplete ? "text-black/80" : "text-white/60"}`}
              >
                {index + 1}.{exercise.name}
              </Text>
              {isComplete && (
                <FontAwesomeIcon
                  icon="circle-check"
                  color={colors.tertiary}
                  size={14}
                />
              )}
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
