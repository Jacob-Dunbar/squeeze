import ExerciseCard from "@/components/ExerciseCard";
import RecoveryCountdown from "@/components/RecoveryCountdown";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import ExerciseSelector from "../components/ExerciseSelector";
import { useUserStore } from "../store/userStore";

export default function Details() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const workout = useUserStore((state) =>
    state.workouts.find((workout) => workout.id === id),
  );

  const logSession = useUserStore((state) => state.logSession);

  const [openExerciseIndex, setOpenExerciseIndex] = useState<number | null>(0);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);

  const [now, setNow] = useState(Date.now());
  const [unlockedEarly, setUnlockedEarly] = useState(false);

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

  const [badgeAnimation, setBadgeAnimation] = useState<{
    exerciseIndex: number;
    setIndex: number;
    id: number;
  } | null>(null);

  const badgeAnimationId = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!workout) {
    return <Text>Workout not found</Text>;
  }

  const getLastWorkoutDate = () => {
    const dates = workout.exercises.flatMap((exercise) =>
      exercise.history.map((session) => new Date(session.date).getTime()),
    );

    if (dates.length === 0) {
      return null;
    }

    return Math.max(...dates);
  };

  const lastWorkoutDate = getLastWorkoutDate();
  const readyAt = lastWorkoutDate
    ? lastWorkoutDate + workout.frequency * 86400000
    : null;
  const workoutReady = unlockedEarly || readyAt === null || now >= readyAt;

  const getProgress = () => {
    if (unlockedEarly) {
      return 1;
    }

    const lastWorkoutDate = getLastWorkoutDate();

    if (!lastWorkoutDate) {
      return 1;
    }

    const totalTime = workout.frequency * 24 * 60 * 60 * 1000;

    const elapsedTime = now - lastWorkoutDate;

    return Math.min(Math.max(elapsedTime / totalTime, 0), 1);
  };

  const getCountdown = () => {
    if (workoutReady || readyAt === null) return "Ready";

    const remaining = readyAt - now;

    if (remaining <= 0) {
      return "Ready";
    }

    const totalSeconds = Math.floor(remaining / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days) return `${days}d ${hours}h ${minutes}m untill unlock`;
    if (hours) return `${hours}h ${minutes}m ${seconds}s untill unlock`;

    if (totalSeconds <= 0) {
      return "Ready";
    }

    return `${minutes}m ${seconds}s untill unlock`;
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

  const editSet = (exerciseIndex: number, setIndex: number) => {
    setSubmittedSets((current) =>
      current.map((count, index) =>
        index === exerciseIndex ? setIndex : count,
      ),
    );
    setSessionData((current) =>
      current.map((session, index) =>
        index === exerciseIndex
          ? {
              ...session,
              reps: session.reps.map((reps, index) =>
                index > setIndex ? "" : reps,
              ),
            }
          : session,
      ),
    );
  };

  const toggleExercise = (index: number) => {
    setOpenExerciseIndex((current) => (current === index ? null : index));
  };

  const selectExercise = (index: number) => {
    setActiveExerciseIndex(index);
    setOpenExerciseIndex(index);
  };

  const submitSet = (exerciseIndex: number) => {
    const setIndex = submittedSets[exerciseIndex] ?? 0;

    const reps = sessionData[exerciseIndex]?.reps[setIndex];

    // Don't allow an empty set to be submitted
    if (!reps) {
      return;
    }

    const targetReps = workout.exercises[exerciseIndex].reps;

    if (Number(reps) >= targetReps) {
      badgeAnimationId.current += 1;
      setBadgeAnimation({
        exerciseIndex,
        setIndex,
        id: badgeAnimationId.current,
      });
    } else {
      setBadgeAnimation(null);
    }

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
    router.replace("/");
  };

  return (
    <View className="flex-1 bg-tertiary">
      {/* Header section ---------------------- */}
      <View className="sticky flex flex-col ">
        <View className="flex flex-row items-center justify-between p-5">
          <View className="flex-row items-center gap-4">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back to home"
              onPress={() => router.replace("/")}
              className="items-center justify-center border rounded-lg size-10 border-white/10 bg-white/5 active:opacity-70"
            >
              <FontAwesomeIcon icon="arrow-left" color="#C4C9AC" size={16} />
            </Pressable>
            <View className="flex flex-col gap-1">
              <Text className="text-xl text-white capitalize font-grotesk">
                {workout.name}
              </Text>
              <View className="flex flex-row items-center gap-2">
                <View className="rounded-full size-2 bg-primary/80"></View>
                <Text className="text-xs tracking-wider uppercase text-primary/80 font-grotesk">
                  Every {workout.frequency} days •{" "}
                  <span className="text-lightText">{getCountdown()}</span>
                </Text>
              </View>
            </View>
          </View>

          {workoutReady ? (
            <Pressable
              onPress={handleLogSession}
              disabled={!allSetsCompleted}
              className={`px-4 py-3 rounded-xl border ${
                allSetsCompleted
                  ? "border-secondary bg-secondary active:opacity-80"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <Text
                className={`text-xs font-bold tracking-widest text-center uppercase font-grotesk ${
                  allSetsCompleted ? "text-tertiary" : "text-white/30"
                }`}
              >
                Complete
              </Text>
            </Pressable>
          ) : null}
        </View>

        {/* Progress Bar ---------------------- */}
        <RecoveryCountdown progress={getProgress()} />
      </View>
      <ScrollView
        className="flex-1 pt-5"
        contentContainerClassName="gap-5 pb-5"
      >
        {workoutReady ? (
          <>
            <ExerciseSelector
              exercises={workout.exercises}
              activeIndex={activeExerciseIndex}
              submittedSets={submittedSets}
              onSelect={selectExercise}
            />

            <View className="flex flex-col gap-5 px-5">
              {workout.exercises[activeExerciseIndex] && (
                <ExerciseCard
                  key={workout.exercises[activeExerciseIndex].id}
                  exercise={workout.exercises[activeExerciseIndex]}
                  sessionExercise={sessionData[activeExerciseIndex]}
                  exerciseIndex={activeExerciseIndex}
                  isOpen={openExerciseIndex === activeExerciseIndex}
                  submittedSets={submittedSets[activeExerciseIndex] ?? 0}
                  badgeAnimation={
                    badgeAnimation?.exerciseIndex === activeExerciseIndex
                      ? badgeAnimation
                      : null
                  }
                  onToggle={() => toggleExercise(activeExerciseIndex)}
                  onUpdateWeight={(value) =>
                    updateWeight(activeExerciseIndex, value)
                  }
                  onUpdateReps={(setIndex, value) =>
                    updateReps(activeExerciseIndex, setIndex, value)
                  }
                  onEditSet={(setIndex) =>
                    editSet(activeExerciseIndex, setIndex)
                  }
                  onBadgeAnimationStart={(id) =>
                    setBadgeAnimation((current) =>
                      current?.id === id ? null : current,
                    )
                  }
                  onSubmitSet={() => submitSet(activeExerciseIndex)}
                />
              )}
            </View>
          </>
        ) : (
          <View className="px-5">
            <Pressable
              onPress={() => setUnlockedEarly(true)}
              className="items-center px-5 py-4 border rounded-xl border-primary bg-primary active:opacity-80"
            >
              <View className="flex-row items-center gap-2">
                <FontAwesomeIcon icon="unlock" color="#181B25" size={16} />
                <Text className="text-sm font-bold tracking-widest text-center uppercase text-tertiary font-grotesk">
                  Unlock workout early
                </Text>
              </View>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
