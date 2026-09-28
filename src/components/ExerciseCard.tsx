import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors } from "../constants/colors";
import type { Exercise } from "../types/workout";
import ExerciseHistory from "./ExerciseHistory";
import RestDiamond from "./RestDiamond";
import SetLogger from "./SetLogger";
type SessionExercise = {
  weight: string;
  reps: string[];
};

type ExerciseCardProps = {
  exercise: Exercise;
  sessionExercise: SessionExercise;
  exerciseIndex: number;
  isOpen: boolean;
  submittedSets: number;
  badgeAnimation: { setIndex: number; id: number } | null;
  onToggle: () => void;
  onUpdateWeight: (value: string) => void;
  onUpdateReps: (setIndex: number, value: string) => void;
  onEditSet: (setIndex: number) => void;
  onBadgeAnimationStart: (id: number) => void;
  onSubmitSet: () => void;
};

export default function ExerciseCard({
  exercise,
  sessionExercise,
  isOpen,
  submittedSets,
  badgeAnimation,
  onToggle,
  onUpdateWeight,
  onUpdateReps,
  onEditSet,
  onBadgeAnimationStart,
  onSubmitSet,
}: ExerciseCardProps) {
  const lastSession = exercise.history[exercise.history.length - 1];

  const targetWeight = lastSession?.weight;

  const [restStarted, setRestStarted] = useState(0);
  const [restFinished, setRestFinished] = useState(false);

  const [editingWeight, setEditingWeight] = useState(false);

  const previousSessions = [...exercise.history].reverse();

  const [contentHeight, setContentHeight] = useState(0);

  const animatedHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: isOpen ? contentHeight : 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [isOpen, contentHeight]);

  return (
    <View>
      <View className="flex flex-row items-center gap-5">
        <Text className="text-2xl !font-bold text-white/80 capitalize font-grotesk">
          {exercise.name}
        </Text>
        <FontAwesomeIcon icon="pen" color="white" size={12} />
      </View>

      <View className="mt-5">
        <Animated.View
          style={{
            height: animatedHeight,
            overflow: "hidden",
          }}
        >
          <View
            className=""
            onLayout={(event) => {
              setContentHeight(event.nativeEvent.layout.height);
            }}
          >
            <View className="flex flex-col gap-4">
              <ExerciseHistory
                sessions={previousSessions}
                targetReps={exercise.reps}
              />

              {/* todays session ---------------------- */}
              <View className="flex flex-col flex-1 rounded-xl bg-white/5">
                <View className="flex flex-row justify-between">
                  <Text className="p-4 pb-3 tracking-wider text-white uppercase font-liberation">
                    Todays Session
                  </Text>
                </View>

                <View className="h-[1px] bg-white/10 mx-4 mb-2"></View>

                {/* Parameters Bar ---------------------- */}
                <View className="flex flex-row gap-3 p-3 mx-4 border rounded-xl bg-tertiary border-white/5">
                  {/* Load */}
                  <Pressable
                    onPress={() => setEditingWeight(true)}
                    className="relative flex flex-col items-center flex-1 gap-3 p-3 border rounded-lg border-white/10 bg-white/[0.025]"
                  >
                    <View className="flex-row items-center w-full gap-2">
                      <View className="flex-row items-center gap-2 text-primary">
                        <View className="rotate-45 !text-primary">
                          <FontAwesomeIcon
                            icon="dumbbell"
                            color={colors.primary}
                            size={16}
                          />
                        </View>

                        <Text className="text-xs uppercase text-lightText font-liberation">
                          Weight
                        </Text>
                      </View>
                    </View>

                    {/* Input */}
                    <View className="flex flex-col items-center gap-2">
                      <View className="flex flex-row items-center gap-3 ml-5">
                        {editingWeight ? (
                          <TextInput
                            autoFocus
                            value={sessionExercise.weight}
                            onChangeText={onUpdateWeight}
                            keyboardType="numbers-and-punctuation"
                            placeholder="0"
                            onBlur={() => setEditingWeight(false)}
                            selectionColor="green"
                            className="w-10 text-2xl text-center text-white font-liberation"
                          />
                        ) : (
                          <Text className="text-2xl text-white font-liberation ">
                            {sessionExercise.weight || "0"}
                          </Text>
                        )}
                        {/* edit icon */}
                        <View className="">
                          <FontAwesomeIcon
                            icon="pen"
                            color={colors.lightText}
                            size={14}
                          />
                        </View>
                      </View>
                      <Text className="text-xs uppercase text-lightText font-liberation">
                        kg
                      </Text>
                    </View>
                  </Pressable>

                  {/* target */}
                  <Pressable
                    onPress={() => setEditingWeight(true)}
                    className="relative flex flex-col items-center flex-1 gap-3 p-3 border rounded-lg border-white/10 bg-white/[0.025]"
                  >
                    <View className="flex-row items-center justify-between w-full gap-2">
                      <View className="flex-row items-center gap-2 text-primary">
                        <View className=" text-primary">
                          <FontAwesomeIcon
                            icon="location-crosshairs"
                            color={colors.primary}
                            size={16}
                          />
                        </View>

                        <Text className="text-xs uppercase text-lightText font-liberation">
                          Target
                        </Text>
                      </View>
                    </View>

                    {/* Input */}
                    <View className="flex flex-col items-center gap-2">
                      <Text className="text-2xl text-white font-liberation ">
                        {exercise.sets || "0"}x{exercise.reps || "0"}
                      </Text>
                      <Text className="text-xs uppercase text-lightText font-liberation">
                        reps
                      </Text>
                    </View>
                  </Pressable>

                  {/* Rest Timer */}
                  <Pressable
                    onPress={() => setEditingWeight(true)}
                    className={`relative flex flex-col items-center flex-1 gap-3 p-3 border rounded-lg ${
                      restFinished
                        ? "border-primary/40 bg-primary/20"
                        : "border-white/10 bg-white/[0.025]"
                    }`}
                  >
                    <View className="flex-row items-center justify-between w-full gap-2">
                      <View className="flex-row items-center gap-2 text-primary">
                        <View className="text-primary">
                          <FontAwesomeIcon
                            icon="hourglass-end"
                            color={colors.primary}
                            size={16}
                          />
                        </View>

                        <Text className="text-xs uppercase text-lightText font-liberation">
                          Rest
                        </Text>
                      </View>
                    </View>

                    {/* Input */}
                    <View className="flex flex-col items-center gap-2">
                      <RestDiamond
                        rest={exercise.rest}
                        restStarted={restStarted}
                        onFinishedChange={setRestFinished}
                      />
                    </View>
                  </Pressable>
                </View>

                {/* Sets section ---------------------- */}
                <View className="flex flex-row justify-between">
                  <Text className="p-4 pb-3 tracking-wider text-white uppercase font-liberation">
                    Sets
                  </Text>

                  <View
                    accessible
                    accessibilityRole="progressbar"
                    accessibilityLabel={`${submittedSets} of ${exercise.sets} sets completed`}
                    accessibilityValue={{
                      min: 0,
                      max: exercise.sets,
                      now: submittedSets,
                    }}
                    className="flex-row items-center gap-1.5 pr-4"
                  >
                    {Array.from({ length: exercise.sets }).map((_, index) => {
                      const isCurrent = index === submittedSets;

                      return (
                        <View
                          key={index}
                          className={`size-2 rounded-full ${
                            index < submittedSets
                              ? "bg-primary/50"
                              : isCurrent
                                ? "bg-primary"
                                : "bg-white/25"
                          }`}
                          style={
                            isCurrent
                              ? {
                                  shadowColor: colors.primary,
                                  shadowOpacity: 1,
                                  shadowRadius: 10,
                                  elevation: 4,
                                }
                              : undefined
                          }
                        />
                      );
                    })}
                  </View>
                </View>

                <View className="h-[1px] bg-white/10 mx-4 "></View>
                {/* Set logger ---------------------- */}
                <SetLogger
                  lastWeekReps={previousSessions[0]?.reps ?? [0, 0, 0]}
                  sets={exercise.sets}
                  targetReps={exercise.reps}
                  reps={sessionExercise.reps}
                  submittedSets={submittedSets}
                  badgeAnimation={badgeAnimation}
                  onUpdateReps={onUpdateReps}
                  onEditSet={onEditSet}
                  onBadgeAnimationStart={onBadgeAnimationStart}
                  onSubmitSet={() => {
                    onSubmitSet();
                    setRestFinished(false);
                    setRestStarted((previous) => previous + 1);
                  }}
                />
              </View>
            </View>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}
