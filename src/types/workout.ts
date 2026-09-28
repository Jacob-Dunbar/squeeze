export interface Workout {
  id: string;
  name: string;
  icon: string;
  frequency: number;
  exercises: Exercise[];
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  rest: number;
  history: HistoryType[];
}

export interface NewWorkout {
  name: string;
  icon: string;
  frequency: number;
  exercises: NewExercise[];
}

export interface NewExercise {
  name: string;
  sets: number;
  reps: number;
  rest: number;
  history: HistoryType[];
}

export interface HistoryType {
  reps: number[];
  weight: number;
  date: string;
}
