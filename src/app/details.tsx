import ExerciseCard from "@/components/ExerciseCard";
import RecoveryCountdown from "@/components/RecoveryCountdown";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { useUserStore } from "../store/userStore";

export default function Details() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const workout = useUserStore((state) =>
    state.workouts.find((workout) => workout.id === id),
  );

  const logSession = useUserStore((state) => state.logSession);

  const [openExerciseIndex, setOpenExerciseIndex] = useState<number | null>(
    null,
  );

  const [now, setNow] = useState(Date.now());

  const [sessionData, setSessionData] = useState(
    workout?.exercises.map((exercise) => {
      const lastSession = exercise.history[exercise.history.length - 1];

      return {
        weight:
          lastSession?.weight !== undefined ? String(lastSession.weight) : "",
        reps: Array(exercise.sets).fill(""),
      };
    }) ?? [],
  );

  const [submittedSets, setSubmittedSets] = useState<number[]>(
    workout?.exercises.map(() => 0) ?? [],
  );

  const [successMessage, setSuccessMessage] = useState<{
    text: string;
    id: number;
  } | null>(null);

  // Update countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!workout) {
    return <Text>Workout not found</Text>;
  }

  // const getLastWorkoutDate = () => {
  //   const dates = workout.exercises.flatMap((exercise) =>
  //     exercise.history.map((session) => new Date(session.date).getTime()),
  //   );

  //   if (dates.length === 0) {
  //     return null;
  //   }

  //   return Math.max(...dates);
  // };

  const getLastWorkoutDate = () => {
    return Date.now() - workout.frequency * 24 * 60 * 60 * 1000;
  };

  // const getProgress = () => {
  //   const lastWorkoutDate = getLastWorkoutDate();

  //   if (!lastWorkoutDate) {
  //     return 1;
  //   }

  //   // Frequency is now DAYS
  //   const totalTime = workout.frequency * 24 * 60 * 60 * 1000;

  //   const elapsedTime = now - lastWorkoutDate;

  //   return Math.min(Math.max(elapsedTime / totalTime, 0), 1);
  // };

  // const getCountdown = () => {
  //   const lastWorkoutDate = getLastWorkoutDate();

  //   if (!lastWorkoutDate) {
  //     return "Ready to train";
  //   }

  //   // Frequency is now DAYS
  //   const readyAt = lastWorkoutDate + workout.frequency * 24 * 60 * 60 * 1000;

  //   const remaining = readyAt - now;

  //   if (remaining <= 0) {
  //     return "Ready to train";
  //   }

  //   const totalSeconds = Math.floor(remaining / 1000);

  //   const days = Math.floor(totalSeconds / 86400);
  //   const hours = Math.floor((totalSeconds % 86400) / 3600);
  //   const minutes = Math.floor((totalSeconds % 3600) / 60);
  //   const seconds = totalSeconds % 60;

  //   if (days > 0) {
  //     return `${days}d ${hours}h ${minutes}m`;
  //   }

  //   if (hours > 0) {
  //     return `${hours}h ${minutes}m ${seconds}s`;
  //   }

  //   return `${minutes}m ${seconds}s`;
  // };

  const getCountdown = () => {
    return "Ready to train";
  };

  const getProgress = () => {
    return 1;
  };

  const updateWeight = (exerciseIndex: number, value: string) => {
    setSessionData((current) =>
      current.map((exercise, index) =>
        index === exerciseIndex
          ? {
              ...exercise,
              weight: value,
            }
          : exercise,
      ),
    );
  };

  const updateReps = (
    exerciseIndex: number,
    setIndex: number,
    value: string,
  ) => {
    setSessionData((current) =>
      current.map((exercise, index) =>
        index === exerciseIndex
          ? {
              ...exercise,
              reps: exercise.reps.map((reps, index) =>
                index === setIndex ? value : reps,
              ),
            }
          : exercise,
      ),
    );
  };

  const toggleExercise = (index: number) => {
    setOpenExerciseIndex((current) => (current === index ? null : index));
  };

  const submitSet = (exerciseIndex: number) => {
    const setIndex = submittedSets[exerciseIndex] ?? 0;

    const reps = sessionData[exerciseIndex]?.reps[setIndex];

    // Don't allow an empty set to be submitted
    if (!reps) {
      return;
    }

    const targetReps = workout.exercises[exerciseIndex].reps;

    setSubmittedSets((current) =>
      current.map((count, index) =>
        index === exerciseIndex ? count + 1 : count,
      ),
    );
  };

  const allSetsCompleted = submittedSets.every(
    (count, index) => count === workout.exercises[index].sets,
  );

  const handleLogSession = () => {
    if (!allSetsCompleted) {
      return;
    }

    const dataToLog = sessionData.map((exercise) => ({
      ...exercise,

      // Convert strings to numbers only when saving
      weight: Number(exercise.weight),
      reps: exercise.reps.map(Number),
    }));

    logSession(id, dataToLog);
  };

  return (
    <View className="flex-1 bg-tertiary">
      <ScrollView className="flex-1" contentContainerClassName="gap-5 pb-5">
        <View className="relative flex flex-col">
          <View className="flex flex-row items-center justify-between p-5">
            <Text className="text-2xl text-white capitalize font-grotesk">
              Chest day
            </Text>

            {/* <Text className=" pixel-label">{workout.frequency} days rest</Text> */}
            <Pressable
              onPress={handleLogSession}
              className="px-6 py-3 rounded-md bg-secondary/40"
            >
              <Text className="font-bold tracking-wider text-center uppercase text-white/60 font-grotesk">
                Complete
              </Text>
            </Pressable>
          </View>

          <RecoveryCountdown progress={getProgress()} />

          {/* <View className="flex flex-row items-end justify-end">
            <Text className="text-xl pixel-heading font-handjet-semibold">
              {getCountdown()}
            </Text>
          </View> */}
        </View>

        <Image
          source={require("../../assets/UI/character.png")}
          className="mx-auto !size-[180px] mb-10"
        />

        <View className="flex flex-col gap-5 m-5">
          {workout.exercises.map((exercise, exerciseIndex) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              sessionExercise={sessionData[exerciseIndex]}
              exerciseIndex={exerciseIndex}
              isOpen={openExerciseIndex === exerciseIndex}
              submittedSets={submittedSets[exerciseIndex] ?? 0}
              onToggle={() => toggleExercise(exerciseIndex)}
              onUpdateWeight={(value) => updateWeight(exerciseIndex, value)}
              onUpdateReps={(setIndex, value) =>
                updateReps(exerciseIndex, setIndex, value)
              }
              onSubmitSet={() => submitSet(exerciseIndex)}
            />
          ))}
        </View>
      </ScrollView>
      {allSetsCompleted && (
        <Pressable onPress={handleLogSession} className="pixel-button">
          <Text className="text-3xl font-bold tracking-wider text-center uppercase text-black/80 font-handjet-semibold">
            Log Session
          </Text>
        </Pressable>
      )}
    </View>
  );
}
