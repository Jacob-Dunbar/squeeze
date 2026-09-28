import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Button,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useUserStore } from "../store/userStore";
import { typography } from "../styles/typography";

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
      exercise.history.map((session) => new Date(session.date).getTime())
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

  return (
    <ScrollView
      contentContainerStyle={{
        gap: 16,
        padding: 16,
      }}
    >
      <Text>level: {level}</Text>
      {workouts.map((workout) => (
        <Pressable
          style={styles.workout_card}
          key={workout.id}
          onPress={() =>
            router.push({
              pathname: "/details",
              params: { id: workout.id },
            })
          }
        >
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.workoutName}>{workout.name}</Text>
              <Text style={styles.frequency}>
                Every {workout.frequency} days
              </Text>
            </View>

            <Pressable
              onPress={() => removeWorkout(workout.id)}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteIcon}>🗑</Text>
            </Pressable>
          </View>

          <Text style={styles.countdown}>{getCountdown(workout)}</Text>

          <View style={styles.progressBar}>
            <View
              style={[
                styles.progress,
                {
                  width: `${getProgress(workout) * 100}%`,
                },
              ]}
            />
          </View>
        </Pressable>
      ))}

      <Button title="Add Workout" onPress={() => router.push("/add-workout")} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  workout_card: {
    backgroundColor: "#d4d3d3",
    padding: 28,
    gap: 8,
  },

  workoutName: {
    fontSize: 22,
    fontWeight: "bold",
    fontFamily: typography.fontFamily,
  },

  frequency: {
    color: "grey",
    fontFamily: typography.fontFamily,
  },

  countdown: {
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: typography.fontFamily,
  },

  progressBar: {
    height: 8,
    backgroundColor: "#e5e5e5",
    borderRadius: 4,
    overflow: "hidden",
  },

  progress: {
    height: "100%",
    backgroundColor: "#000",
    borderRadius: 4,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  deleteButton: {
    padding: 4,
  },

  deleteIcon: {
    fontSize: 18,
  },
});
