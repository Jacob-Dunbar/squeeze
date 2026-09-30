import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { HistoryType, NewWorkout, Workout } from "../types/workout";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const createSampleHistory = (
  snapshots: { weight: number; reps: number[] }[],
): HistoryType[] =>
  snapshots.map((snapshot, index) => ({
    ...snapshot,
    date: new Date(
      Date.now() - (snapshots.length - index) * 7 * DAY_IN_MS,
    ).toISOString(),
  }));

const createDefaultWorkouts = (): Workout[] => [
  {
    id: "demo-push",
    name: "Push Workout",
    icon: "dumbbell",
    frequency: 3,
    exercises: [
      {
        id: "demo-push-bench",
        name: "Bench Press",
        sets: 3,
        reps: 8,
        rest: 90,
        history: createSampleHistory([
          { weight: 35, reps: [7, 7, 6] },
          { weight: 37.5, reps: [8, 7, 7] },
          { weight: 40, reps: [8, 8, 7] },
          { weight: 42.5, reps: [9, 8, 8] },
        ]),
      },
      {
        id: "demo-push-overhead-press",
        name: "Overhead Press",
        sets: 3,
        reps: 8,
        rest: 90,
        history: createSampleHistory([
          { weight: 15, reps: [8, 7, 6] },
          { weight: 17.5, reps: [8, 8, 6] },
          { weight: 17.5, reps: [8, 8, 8] },
          { weight: 20, reps: [8, 8, 8] },
        ]),
      },
    ],
  },
  {
    id: "demo-pull",
    name: "Pull Workout",
    icon: "weight-hanging",
    frequency: 3,
    exercises: [
      {
        id: "demo-pull-lat-pulldown",
        name: "Lat Pulldown",
        sets: 3,
        reps: 10,
        rest: 90,
        history: createSampleHistory([
          { weight: 30, reps: [10, 10, 10] },
          { weight: 30, reps: [10, 10, 9] },
          { weight: 30, reps: [9, 8, 8] },
          { weight: 30, reps: [8, 8, 7] },
        ]),
      },
      {
        id: "demo-pull-row",
        name: "Seated Row",
        sets: 3,
        reps: 10,
        rest: 90,
        history: createSampleHistory([
          { weight: 30, reps: [10, 10, 10] },
          { weight: 30, reps: [10, 9, 9] },
          { weight: 30, reps: [9, 9, 8] },
          { weight: 30, reps: [8, 7, 7] },
        ]),
      },
    ],
  },
  {
    id: "demo-legs",
    name: "Legs Workout",
    icon: "person-running",
    frequency: 3,
    exercises: [
      {
        id: "demo-legs-goblet-squat",
        name: "Goblet Squat",
        sets: 3,
        reps: 10,
        rest: 90,
        history: createSampleHistory([
          { weight: 12, reps: [10, 9, 8] },
          { weight: 14, reps: [10, 10, 9] },
          { weight: 16, reps: [10, 10, 10] },
          { weight: 18, reps: [10, 10, 10] },
        ]),
      },
      {
        id: "demo-legs-romanian-deadlift",
        name: "Romanian Deadlift",
        sets: 3,
        reps: 8,
        rest: 90,
        history: createSampleHistory([
          { weight: 20, reps: [8, 8, 7] },
          { weight: 22.5, reps: [8, 8, 8] },
          { weight: 25, reps: [8, 8, 8] },
          { weight: 27.5, reps: [8, 8, 8] },
        ]),
      },
    ],
  },
];

interface UserState {
  xp: number;
  workouts: Workout[];
  addWorkout: (workout: NewWorkout) => void;
  updateWorkout: (workout: Workout) => void;
  updateExerciseHistoryWeight: (
    workoutId: string,
    exerciseId: string,
    sessionDate: string,
    weight: number,
  ) => void;
  removeWorkout: (id: string) => void;
  logSession: (
    workoutId: string,
    sessionData: {
      weight: number;
      reps: number[];
    }[],
  ) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      xp: 0,
      workouts: createDefaultWorkouts(),

      addWorkout: (workout) =>
        set((state) => ({
          workouts: [
            ...state.workouts,
            {
              ...workout,
              id: crypto.randomUUID(),
              exercises: workout.exercises.map((exercise) => ({
                ...exercise,
                id: crypto.randomUUID(),
              })),
            },
          ],
        })),

      updateWorkout: (updatedWorkout) =>
        set((state) => ({
          workouts: state.workouts.map((workout) =>
            workout.id === updatedWorkout.id ? updatedWorkout : workout,
          ),
        })),

      updateExerciseHistoryWeight: (
        workoutId,
        exerciseId,
        sessionDate,
        weight,
      ) =>
        set((state) => ({
          workouts: state.workouts.map((workout) =>
            workout.id !== workoutId
              ? workout
              : {
                  ...workout,
                  exercises: workout.exercises.map((exercise) =>
                    exercise.id !== exerciseId
                      ? exercise
                      : {
                          ...exercise,
                          history: exercise.history.map((session) =>
                            session.date === sessionDate
                              ? { ...session, weight }
                              : session,
                          ),
                        },
                  ),
                },
          ),
        })),

      removeWorkout: (id: string) =>
        set((state) => ({
          workouts: state.workouts.filter((workout) => workout.id !== id),
        })),

      logSession: (workoutId, sessionData) =>
        set((state) => ({
          workouts: state.workouts.map((workout) => {
            if (workout.id !== workoutId) return workout;

            return {
              ...workout,
              exercises: workout.exercises.map((exercise, index) => ({
                ...exercise,
                history: [
                  ...exercise.history,
                  {
                    date: new Date().toISOString(),
                    weight: sessionData[index].weight,
                    reps: sessionData[index].reps,
                  },
                ],
              })),
            };
          }),
        })),
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
