import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import RecoveryCountdown from "../components/RecoveryCountdown";
import { WORKOUT_ICON_OPTIONS } from "../constants/workoutIcons";
import { useUserStore } from "../store/userStore";
import { getWorkoutProgressTags } from "../workoutProgress";

export default function Index() {
  const workouts = useUserStore((state) => state.workouts);
  const level = useUserStore((state) => state.xp);
  const removeWorkout = useUserStore((state) => state.removeWorkout);

  const [, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getLastWorkoutDate = (workout: (typeof workouts)[number]) => {
    const dates = workout.exercises.flatMap((exercise) =>
      exercise.history.map((session) => new Date(session.date).getTime()),
    );

    if (dates.length === 0) {
      return null;
    }

    return Math.max(...dates);
  };

  const getCountdown = (workout: (typeof workouts)[number]) => {
    const lastWorkoutDate = getLastWorkoutDate(workout);

    if (!lastWorkoutDate) {
      return "Ready to train";
    }

    const readyAt = lastWorkoutDate + workout.frequency * 24 * 60 * 60 * 1000;

    const remaining = readyAt - Date.now();

    if (remaining <= 0) {
      const daysOverdue = Math.floor(Math.abs(remaining) / 86400000);

      if (daysOverdue > 0) {
        return `${daysOverdue} ${daysOverdue === 1 ? "day" : "days"} overdue`;
      }

      return "Ready to train";
    }

    const totalSeconds = Math.floor(remaining / 1000);

    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    }

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }

    return `${minutes}m ${seconds}s`;
  };

  const getProgress = (workout: (typeof workouts)[number]) => {
    const lastWorkoutDate = getLastWorkoutDate(workout);

    if (!lastWorkoutDate) {
      return 1;
    }

    const totalTime = workout.frequency * 24 * 60 * 60 * 1000;
    const elapsedTime = Date.now() - lastWorkoutDate;

    return Math.min(Math.max(elapsedTime / totalTime, 0), 1);
  };

  const sortNow = Date.now();
  const getTimeUntilReady = (workout: (typeof workouts)[number]) => {
    const lastWorkoutDate = getLastWorkoutDate(workout);

    if (!lastWorkoutDate) {
      return 0;
    }

    return lastWorkoutDate + workout.frequency * 86400000 - sortNow;
  };
  const sortedWorkouts = [...workouts].sort(
    (first, second) => getTimeUntilReady(first) - getTimeUntilReady(second),
  );

  return (
    <View className="flex-1 bg-tertiary">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-5 pt-6 pb-8"
      >
        <View className="flex-row items-center justify-between">
          <View className="gap-1">
            <Text className="text-2xl font-bold tracking-widest text-white uppercase font-grotesk">
              Squeeze
            </Text>
            <Text className="text-[10px] tracking-[2px] text-lightText uppercase font-liberation">
              Training log
            </Text>
          </View>

          <View className="items-end px-3 py-2 border rounded-lg border-primary/20 bg-primary/5">
            <Text className="text-[9px] tracking-widest text-lightText uppercase font-liberation">
              Level
            </Text>
            <Text className="text-lg text-primary font-grotesk-semibold">
              {level}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between mt-2">
          <View>
            <Text className="text-sm tracking-widest text-white uppercase font-liberation">
              Workouts
            </Text>
            <Text className="mt-1 text-xs text-lightText">
              {workouts.length} workout modules
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/add-workout")}
            className="flex-row items-center gap-2 px-4 py-3 rounded-lg bg-primary active:opacity-80"
          >
            <FontAwesomeIcon icon="plus" color="#181B25" size={13} />
            <Text className="text-xs font-bold tracking-wider uppercase text-tertiary font-grotesk">
              Add workout
            </Text>
          </Pressable>
        </View>

        {workouts.length === 0 ? (
          <View className="items-center gap-2 px-5 py-12 border rounded-xl border-white/10 bg-white/[0.03]">
            <Text className="text-base text-white font-grotesk">
              No workouts yet
            </Text>
            <Text className="text-xs text-center text-lightText">
              Add a workout to start tracking your training.
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {sortedWorkouts.map((workout) => {
              const countdown = getCountdown(workout);
              const isReady = getProgress(workout) >= 1;
              const workoutIcon = WORKOUT_ICON_OPTIONS.find(
                (option) => option.name === workout.icon,
              );
              const exerciseCount = workout.exercises.length;
              const totalSets = workout.exercises.reduce(
                (total, exercise) => total + exercise.sets,
                0,
              );
              const progressTags = getWorkoutProgressTags(workout.exercises);

              return (
                <View
                  key={workout.id}
                  className="overflow-hidden border rounded-xl border-white/10 bg-white/[0.035]"
                >
                  <ReanimatedSwipeable
                    overshootRight={false}
                    rightThreshold={32}
                    containerStyle={{ borderRadius: 12, overflow: "hidden" }}
                    renderRightActions={() => (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Delete ${workout.name}`}
                        onPress={() => removeWorkout(workout.id)}
                        style={{ width: 84 }}
                        className="items-center justify-center gap-1 bg-red-500/90"
                      >
                        <FontAwesomeIcon
                          icon="trash-can"
                          color="white"
                          size={16}
                        />
                        <Text className="text-[10px] font-bold tracking-wider text-white uppercase font-liberation">
                          Delete
                        </Text>
                      </Pressable>
                    )}
                  >
                    <Pressable
                      accessibilityRole="button"
                      onPress={() =>
                        router.push({
                          pathname: "/details",
                          params: { id: workout.id },
                        })
                      }
                      className="flex flex-col gap-3 p-4 bg-white/[0.03]"
                    >
                      <View className="flex flex-row gap-4">
                        <View className="items-center justify-center border rounded-lg size-12 border-primary/25 bg-primary/5">
                          {workoutIcon ? (
                            <FontAwesomeIcon
                              icon={workoutIcon.icon}
                              color="#C3F400"
                              size={20}
                            />
                          ) : (
                            <Text className="text-xl uppercase text-primary font-grotesk-semibold">
                              {workout.name.trim().charAt(0) || "?"}
                            </Text>
                          )}
                        </View>
                        <View className="flex flex-col flex-1">
                          <View className="flex-row items-start justify-between gap-3">
                            <View className="flex-1 gap-1">
                              <Text className="text-lg text-white uppercase font-grotesk-semibold">
                                {workout.name}
                              </Text>
                              <Text className="text-xs font-liberation text-lightText">
                                Every {workout.frequency} days
                              </Text>
                            </View>
                            <View
                              className={`px-2 py-1 rounded-md ${
                                isReady ? "bg-primary/10" : "bg-secondary/10"
                              }`}
                            >
                              <Text
                                className={`text-[10px] uppercase font-liberation ${
                                  isReady ? "text-primary" : "text-secondary"
                                }`}
                              >
                                {isReady ? "Ready" : "Recovering"}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>

                      <View className="flex-row flex-wrap gap-2">
                        <View className="px-2 py-1 border rounded-md border-white/10 bg-white/5">
                          <Text className="text-[10px] text-lightText font-liberation">
                            {exerciseCount}{" "}
                            {exerciseCount === 1 ? "exercise" : "exercises"}
                          </Text>
                        </View>
                        <View className="px-2 py-1 border rounded-md border-white/10 bg-white/5">
                          <Text className="text-[10px] text-lightText font-liberation">
                            {totalSets} {totalSets === 1 ? "set" : "sets"}
                          </Text>
                        </View>
                        {progressTags.map((tag) => (
                          <View
                            key={tag.label}
                            className={`px-2 py-1 border rounded-md ${
                              tag.amount > 0
                                ? "border-primary/20 bg-primary/10"
                                : tag.amount < 0
                                  ? "border-red-500/20 bg-red-500/10"
                                  : "border-white/10 bg-white/5"
                            }`}
                          >
                            <Text
                              className={`text-[10px] font-liberation ${
                                tag.amount > 0
                                  ? "text-primary"
                                  : tag.amount < 0
                                    ? "text-red-400"
                                    : "text-lightText"
                              }`}
                            >
                              {tag.label}
                            </Text>
                          </View>
                        ))}
                      </View>

                      <RecoveryCountdown progress={getProgress(workout)} />

                      <Text className="text-xs font-liberation text-lightText">
                        {countdown}
                      </Text>
                    </Pressable>
                  </ReanimatedSwipeable>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
