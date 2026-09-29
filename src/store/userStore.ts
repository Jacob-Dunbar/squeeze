import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { NewWorkout, Workout } from "../types/workout";

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
      workouts: [
        {
          name: "chest",
          id: "test",
          icon: "test",
          frequency: 24,
          exercises: [
            {
              name: "Bench Press",
              id: "test",
              sets: 3,
              reps: 8,
              rest: 120,
              history: [],
            },
          ],
        },
      ],

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
