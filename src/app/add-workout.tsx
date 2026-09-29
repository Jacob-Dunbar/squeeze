import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import ActionButton from "../components/ActionButton";
import { WORKOUT_ICON_OPTIONS } from "../constants/workoutIcons";
import { useUserStore } from "../store/userStore";
import type { Exercise, NewWorkout } from "../types/workout";

export default function AddWorkout() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const existingWorkout = useUserStore((state) =>
    state.workouts.find((workout) => workout.id === id),
  );
  const addWorkout = useUserStore((state) => state.addWorkout);
  const updateWorkout = useUserStore((state) => state.updateWorkout);
  const isEditing = Boolean(id);

  const [name, setName] = useState("");
  const [iconName, setIconName] = useState("dumbbell");
  const [showAllIcons, setShowAllIcons] = useState(false);
  const [frequency, setFrequency] = useState(1);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  const initialIconOptions = WORKOUT_ICON_OPTIONS.slice(0, 8);
  const selectedIconOption = WORKOUT_ICON_OPTIONS.find(
    (option) => option.name === iconName,
  );
  const visibleIconOptions = showAllIcons
    ? WORKOUT_ICON_OPTIONS
    : selectedIconOption &&
        !initialIconOptions.some((option) => option.name === iconName)
      ? [...initialIconOptions, selectedIconOption]
      : initialIconOptions;

  useEffect(() => {
    if (!existingWorkout) return;

    setName(existingWorkout.name);
    setIconName(
      WORKOUT_ICON_OPTIONS.some(
        (option) => option.name === existingWorkout.icon,
      )
        ? existingWorkout.icon
        : "dumbbell",
    );
    setFrequency(existingWorkout.frequency);
    setExercises(
      existingWorkout.exercises.map((exercise) => ({ ...exercise })),
    );
  }, [existingWorkout]);

  const addExercise = () => {
    setExercises((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: "",
        sets: 3,
        reps: 10,
        rest: 120,
        history: [],
      },
    ]);
  };

  const removeExercise = (index: number) => {
    setExercises((current) =>
      current.filter((_, exerciseIndex) => exerciseIndex !== index),
    );
  };

  const updateExercise = (
    index: number,
    field: "name" | "sets" | "reps" | "rest",
    value: string,
  ) => {
    setExercises((current) =>
      current.map((exercise, exerciseIndex) => {
        if (exerciseIndex !== index) return exercise;

        if (field === "name") {
          return {
            ...exercise,
            name: value,
          };
        }

        return {
          ...exercise,
          [field]: Number(value),
        };
      }),
    );
  };

  const handleCreateWorkout = () => {
    if (!name.trim() || exercises.length === 0) return;

    if (existingWorkout) {
      updateWorkout({
        ...existingWorkout,
        name: name.trim(),
        frequency,
        icon: iconName,
        exercises,
      });
    } else {
      const newWorkout: NewWorkout = {
        name: name.trim(),
        frequency,
        icon: iconName,
        exercises: exercises.map(({ id: _id, ...exercise }) => exercise),
      };
      addWorkout(newWorkout);
    }

    router.back();
  };

  const canSave =
    Boolean(name.trim()) &&
    exercises.length > 0 &&
    (!isEditing || Boolean(existingWorkout));

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{ title: isEditing ? "Edit Workout" : "New Workout" }}
      />

      <View className="items-center pt-3">
        <View className="w-10 h-1 rounded-full bg-white/20" />
      </View>

      {/* Header Section ----------------------  */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-white/10">
        <View className="gap-1">
          <Text className="text-lg tracking-wider text-white uppercase font-grotesk-semibold">
            {isEditing ? "Edit workout" : "New workout"}
          </Text>
          <Text className="text-xs text-lightText">
            {isEditing
              ? "Update your plan and keep its training history"
              : "Build a training plan"}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close workout form"
          onPress={() => router.back()}
          className="items-center justify-center border rounded-lg size-10 border-white/10 bg-white/5 active:bg-white/10"
        >
          <FontAwesomeIcon icon="xmark" color="#C4C9AC" size={17} />
        </Pressable>
      </View>

      {/* Loading ----------------------  */}
      {isEditing && !existingWorkout ? (
        <View className="items-center justify-center flex-1">
          <Text className="text-sm text-lightText">Loading workout...</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="gap-5 p-5 pb-8"
        >
          {/* Form Section ----------------------  */}
          <View className="gap-2">
            <View></View>
            {/* Name ----------------------  */}
            <Text className="text-xs tracking-widest uppercase text-lightText font-liberation">
              Workout name
            </Text>
            <View className="flex flex-col mb-1">
              <Text className="text-[10px] text-lightText/70">
                Give your workout a name, this is a group of exercises you’ll do
                together.
              </Text>
              <Text className="text-[10px] text-lightText/70">
                Eg. “Arm Workout”, “Leg Day” or “Push Workout (Heavy)”.
              </Text>
            </View>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Chest"
              placeholderTextColor="#737765"
              className="px-3 py-3 text-white border rounded-lg border-white/10 bg-white/5 font-grotesk"
            />
          </View>

          {/* Icon ----------------------  */}
          <View className="gap-2">
            <Text className="text-xs tracking-widest uppercase text-lightText font-liberation">
              Workout icon
            </Text>
            <Text className="text-[10px] text-lightText/70 mb-1">
              Pick a symbol to identify this plan
            </Text>
            <View className="flex-row flex-wrap justify-between gap-y-2">
              {visibleIconOptions.map((option) => {
                const selected = option.name === iconName;

                return (
                  <Pressable
                    key={option.name}
                    accessibilityRole="radio"
                    accessibilityLabel={option.label}
                    accessibilityState={{ checked: selected }}
                    onPress={() => setIconName(option.name)}
                    className={`h-16 w-[23.5%] items-center justify-center gap-1.5 rounded-lg border ${
                      selected
                        ? "border-primary/80 bg-primary/10"
                        : "border-white/10 bg-white/[0.03]"
                    }`}
                  >
                    {option.icon ? (
                      <FontAwesomeIcon
                        icon={option.icon}
                        color={selected ? "#C3F400" : "#C4C9AC"}
                        size={19}
                      />
                    ) : (
                      <Text
                        className={`text-[10px] font-liberation ${
                          selected ? "text-primary" : "text-lightText"
                        }`}
                      >
                        None
                      </Text>
                    )}
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      className={`max-w-[90%] text-[9px] ${
                        selected ? "text-primary" : "text-lightText"
                      }`}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {WORKOUT_ICON_OPTIONS.length > 8 && (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: showAllIcons }}
                onPress={() => setShowAllIcons((current) => !current)}
                className="self-start px-2 py-1"
              >
                <Text className="text-xs text-primary font-liberation">
                  {showAllIcons
                    ? "Show fewer icons"
                    : `Show all ${WORKOUT_ICON_OPTIONS.length} icons`}
                </Text>
              </Pressable>
            )}
          </View>

          {/* Frequency ----------------------  */}
          <View className="w-full gap-2">
            <Text className="text-xs tracking-widest uppercase text-lightText font-liberation">
              Frequency (days)
            </Text>
            <Text className="text-[10px] mb-1 text-lightText/70">
              This is how many days you’ll rest between workouts. For example, 3
              means you’ll rest for 3 days before doing this workout again.
            </Text>
            <TextInput
              value={String(frequency)}
              onChangeText={(value) => setFrequency(Number(value) || 1)}
              keyboardType="number-pad"
              inputMode="numeric"
              className="w-32 px-3 py-3 text-white border rounded-lg border-white/10 bg-white/5 font-grotesk"
            />
          </View>

          {/* Exercises ----------------------  */}
          <View className="flex-row items-center justify-between">
            <View className="flex-1 min-w-0 pr-3">
              <Text className="text-sm tracking-widest text-white uppercase font-liberation">
                Exercises
              </Text>

              <Text className="text-[10px] mb-1 text-lightText/70">
                These are the exercises that make up your workout. You will do
                them every time you do this workout.
              </Text>
            </View>
          </View>

          {exercises.length === 0 ? (
            <View className="items-center px-4 py-8 border rounded-xl border-white/10 bg-white/[0.03]">
              <Text className="text-sm text-lightText">
                No exercises added yet.
              </Text>
            </View>
          ) : (
            exercises.map((exercise, index) => (
              <View
                key={exercise.id}
                className="gap-3 p-4 border rounded-xl border-white/10 bg-white/[0.03]"
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-white uppercase font-grotesk-semibold">
                    Exercise {index + 1}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove exercise ${index + 1}`}
                    onPress={() => removeExercise(index)}
                    className="px-2 py-1 rounded-md bg-tertiary/10 active:bg-tertiary/20"
                  >
                    <Text className="text-xs text-tertiary font-liberation">
                      Remove
                    </Text>
                  </Pressable>
                </View>

                <View className="gap-1">
                  {/* Exercise Name Input */}
                  <Text className="text-[10px] tracking-widest text-lightText uppercase font-liberation">
                    Name
                  </Text>
                  <Text className="text-[10px] mb-1 text-lightText/70">
                    The movement you will perform
                  </Text>
                  <TextInput
                    value={exercise.name}
                    onChangeText={(value) =>
                      updateExercise(index, "name", value)
                    }
                    placeholder="e.g. Bench Press"
                    placeholderTextColor="#737765"
                    className="px-3 py-3 text-white border rounded-lg border-white/10 bg-white/5 font-grotesk"
                  />
                </View>

                <View className="flex-row gap-4 mt-2">
                  {/* Exercise Details Inputs */}
                  {(
                    [
                      ["sets", "Sets", exercise.sets],
                      ["reps", "Reps", exercise.reps],
                      ["rest", "Rest (sec)", exercise.rest],
                    ] as const
                  ).map(([field, label, value]) => (
                    <View key={field} className="flex-1 gap-1">
                      <Text className="text-[10px] tracking-widest text-lightText uppercase font-liberation">
                        {label}
                      </Text>
                      <Text className="text-[9px] mb-1 text-lightText/70">
                        {field === "sets"
                          ? "Working sets"
                          : field === "reps"
                            ? "Per set"
                            : "Recovery"}
                      </Text>
                      <TextInput
                        value={String(value)}
                        onChangeText={(input) =>
                          updateExercise(index, field, input)
                        }
                        keyboardType="number-pad"
                        inputMode="numeric"
                        className="px-3 py-3 text-center text-white border rounded-lg border-white/10 bg-white/5 font-grotesk"
                      />
                    </View>
                  ))}
                </View>
              </View>
            ))
          )}
          <ActionButton
            label="Add exercise"
            icon="plus"
            type="primary"
            onPress={addExercise}
          />
        </ScrollView>
      )}

      {/* Buttons ----------------------  */}
      <View className="flex-row gap-3 p-4 border-t border-white/10 bg-background">
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          className="items-center justify-center flex-1 px-4 py-3 border rounded-xl border-white/10 bg-white/5 active:bg-white/10"
        >
          <Text className="text-xs tracking-widest uppercase text-lightText font-grotesk">
            Cancel
          </Text>
        </Pressable>
        <ActionButton
          label={isEditing ? "Save changes" : "Create workout"}
          type="primary"
          state={canSave ? "active" : "disabled"}
          onPress={handleCreateWorkout}
          className="flex-1"
        />
      </View>
    </View>
  );
}
