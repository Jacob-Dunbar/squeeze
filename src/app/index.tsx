import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import ActionButton from "../components/ActionButton";
import RecoveryCountdown from "../components/RecoveryCountdown";
import Tag from "../components/Tag";
import { WORKOUT_ICON_OPTIONS } from "../constants/workoutIcons";
import { useUserStore } from "../store/userStore";
import { getWorkoutProgressTags } from "../workoutProgress";

export default function Index() {
  const workouts = useUserStore((state) => state.workouts);
  const level = useUserStore((state) => state.xp);
  const removeWorkout = useUserStore((state) => state.removeWorkout);
  const [openSwipeWorkoutId, setOpenSwipeWorkoutId] = useState<string | null>(
    null,
  );

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
    <View className="flex-1 bg-background">
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

          <ActionButton
            label="Add workout"
            icon="plus"
            type="primary"
            onPress={() => router.push("/add-workout")}
          />
        </View>

        {/* Workouts Section --------------------- */}
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
              const timeUntilReady = getTimeUntilReady(workout);
              const isOverdue = timeUntilReady <= -86400000;
              const isReady = timeUntilReady <= 0;
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
                    containerStyle={{ borderRadius: 12, overflow: "hidden" }}
                    childrenContainerStyle={{
                      flex: 1,
                      zIndex: openSwipeWorkoutId === workout.id ? 0 : 1,
                      elevation: openSwipeWorkoutId === workout.id ? 0 : 1,
                    }}
                    onSwipeableOpen={() => setOpenSwipeWorkoutId(workout.id)}
                    onSwipeableWillClose={() => setOpenSwipeWorkoutId(null)}
                    renderRightActions={(_, __, swipeableMethods) => (
                      <View
                        className="flex-row h-full"
                        style={{
                          zIndex: openSwipeWorkoutId === workout.id ? 2 : 0,
                          elevation: openSwipeWorkoutId === workout.id ? 2 : 0,
                        }}
                      >
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Edit ${workout.name}`}
                          onPress={() => {
                            swipeableMethods.close();
                            router.push({
                              pathname: "/add-workout",
                              params: { id: workout.id },
                            });
                          }}
                          style={{ width: 76, height: "100%" }}
                          className="items-center justify-center gap-2 bg-white/10"
                        >
                          <FontAwesomeIcon icon="pen" color="white" size={16} />
                          <Text className="text-[10px] font-bold tracking-wider text-white uppercase font-liberation">
                            Edit
                          </Text>
                        </Pressable>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Delete ${workout.name}`}
                          onPress={() => removeWorkout(workout.id)}
                          style={{ width: 76, height: "100%" }}
                          className="items-center justify-center gap-2 bg-tertiary/90"
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
                      </View>
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
                      className={`flex flex-col gap-3 p-4 ${
                        isReady ? "bg-[#252A34]" : "bg-background"
                      }`}
                    >
                      <View className="flex flex-row gap-4">
                        <View className="items-center justify-center border rounded-lg size-12 border-primary/25 bg-primary/5">
                          {/* Workout Icon or Initial */}
                          {workoutIcon?.icon ? (
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

                        {/* Workout Name and Frequency */}
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
                            <Tag
                              label={
                                isOverdue
                                  ? "Overdue"
                                  : isReady
                                    ? "Ready"
                                    : "Recovering"
                              }
                              type={
                                isOverdue
                                  ? "tertiary"
                                  : isReady
                                    ? "primary"
                                    : "secondary"
                              }
                            />
                          </View>
                        </View>
                      </View>

                      {/* Workout Stats and Progress Tags */}
                      <View className="flex-row flex-wrap gap-2">
                        <Tag
                          label={`${exerciseCount} ${exerciseCount === 1 ? "exercise" : "exercises"}`}
                          type="neutral"
                        />
                        <Tag
                          label={`${totalSets} ${totalSets === 1 ? "set" : "sets"}`}
                          type="neutral"
                        />
                        {progressTags.map((tag) => (
                          <Tag
                            key={tag.label}
                            label={tag.label}
                            type={
                              tag.amount > 0
                                ? "primary"
                                : tag.amount < 0
                                  ? "tertiary"
                                  : "secondary"
                            }
                          />
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
