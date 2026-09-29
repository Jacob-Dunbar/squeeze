import type { Exercise, HistoryType } from "./types/workout";

export type HistoryProgress = {
  amount: number;
  label: string;
  type: "percentage" | "weight";
  unit: "reps" | "vol" | "kg";
};

const getWeight = (session: HistoryType) => {
  const weight = Number(session.weight);
  return Number.isFinite(weight) ? weight : 0;
};

const getTotalReps = (session: HistoryType) =>
  session.reps.reduce((total, reps) => total + reps, 0);

const getVolume = (session: HistoryType) => {
  const weight = getWeight(session);
  return session.reps.reduce((total, reps) => total + weight * reps, 0);
};

export const getAverageSetVolume = (session: HistoryType) =>
  session.reps.length === 0 ? 0 : getVolume(session) / session.reps.length;

export const getHistoryProgress = (
  sessions: HistoryType[],
): HistoryProgress | null => {
  const recentSessions = [...sessions]
    .sort(
      (first, second) =>
        new Date(second.date).getTime() - new Date(first.date).getTime(),
    )
    .slice(0, 4);

  if (recentSessions.length < 4) return null;

  const latestSession = recentSessions[0];
  const baselineSession = recentSessions[3];
  const latestWeight = getWeight(latestSession);
  const baselineWeight = getWeight(baselineSession);

  if (baselineWeight === 0 && latestWeight > 0) {
    const amount = Number((latestWeight - baselineWeight).toFixed(2));
    return {
      amount,
      label: `+ ${amount}kg`,
      type: "weight",
      unit: "kg",
    };
  }

  const allUnweighted = recentSessions.every(
    (session) => getWeight(session) === 0,
  );
  const unit = allUnweighted ? "reps" : "vol";
  const baselineValue = allUnweighted
    ? getTotalReps(baselineSession)
    : getVolume(baselineSession);
  const latestValue = allUnweighted
    ? getTotalReps(latestSession)
    : getVolume(latestSession);

  if (baselineValue <= 0) return null;

  const amount = Math.round(
    ((latestValue - baselineValue) / baselineValue) * 100,
  );

  return {
    amount,
    label: `${amount > 0 ? "+" : ""}${amount}% vol`,
    type: "percentage",
    unit: allUnweighted ? "reps" : unit,
  };
};

export const getWorkoutProgressTags = (exercises: Exercise[]) => {
  const progress = exercises
    .map((exercise) => getHistoryProgress(exercise.history))
    .filter((item): item is HistoryProgress => item !== null);
  const tags: { label: string; amount: number }[] = [];
  const percentageProgress = progress.filter(
    (item) => item.type === "percentage",
  );

  if (percentageProgress.length > 0) {
    const averageChange = Math.round(
      percentageProgress.reduce((total, item) => total + item.amount, 0) /
        percentageProgress.length,
    );
    const sign = averageChange > 0 ? "+" : "";

    tags.push({
      label: `${percentageProgress.length > 1 ? "Avg " : ""}${sign}${averageChange}% vol`,
      amount: averageChange,
    });
  }

  const weightProgress = progress.filter((item) => item.type === "weight");

  if (weightProgress.length > 0) {
    const totalAdded = Number(
      weightProgress.reduce((total, item) => total + item.amount, 0).toFixed(2),
    );

    tags.push({
      label:
        weightProgress.length === 1
          ? weightProgress[0].label
          : `+ ${totalAdded}kg added`,
      amount: totalAdded,
    });
  }

  return tags;
};
