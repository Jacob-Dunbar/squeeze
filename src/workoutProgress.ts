import type { Exercise, HistoryType } from "./types/workout";

export type HistoryProgress = {
  amount: number;
  label: string;
  type: "percentage" | "weight" | "assistance";
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

export const getHistoryComparisonChange = (
  current: HistoryType,
  previous: HistoryType,
) => {
  const currentWeight = getWeight(current);
  const previousWeight = getWeight(previous);
  const weightChange = currentWeight - previousWeight;

  if (weightChange !== 0 && (currentWeight < 0 || previousWeight < 0)) {
    return weightChange;
  }

  if (currentWeight <= 0 && currentWeight === previousWeight) {
    const currentAverageReps =
      getTotalReps(current) / (current.reps.length || 1);
    const previousAverageReps =
      getTotalReps(previous) / (previous.reps.length || 1);
    return currentAverageReps - previousAverageReps;
  }

  return getAverageSetVolume(current) - getAverageSetVolume(previous);
};

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
  const weightChange = Number((latestWeight - baselineWeight).toFixed(2));

  if (weightChange !== 0 && (baselineWeight < 0 || latestWeight < 0)) {
    if (weightChange > 0) {
      const isLoadedWeight = latestWeight > 0;
      return {
        amount: weightChange,
        label: isLoadedWeight
          ? `+ ${weightChange}kg load increase`
          : `+ ${weightChange}kg less assistance`,
        type: isLoadedWeight ? "weight" : "assistance",
        unit: "kg",
      };
    }

    const assistanceAdded = Math.abs(weightChange);
    return {
      amount: -assistanceAdded,
      label: `${assistanceAdded}kg more assistance`,
      type: "assistance",
      unit: "kg",
    };
  }

  if (baselineWeight === 0 && latestWeight > 0) {
    const amount = Number((latestWeight - baselineWeight).toFixed(2));
    return {
      amount,
      label: `+ ${amount}kg`,
      type: "weight",
      unit: "kg",
    };
  }

  const sameUnloadedEndpointWeight =
    baselineWeight <= 0 && baselineWeight === latestWeight;
  const baselineValue = sameUnloadedEndpointWeight
    ? getTotalReps(baselineSession)
    : getVolume(baselineSession);
  const latestValue = sameUnloadedEndpointWeight
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
    unit: "vol",
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

  const assistanceProgress = progress.filter(
    (item) => item.type === "assistance",
  );

  if (assistanceProgress.length > 0) {
    const totalChange = Number(
      assistanceProgress
        .reduce((total, item) => total + item.amount, 0)
        .toFixed(2),
    );
    const absoluteChange = Math.abs(totalChange);

    tags.push({
      label:
        totalChange > 0
          ? `+ ${absoluteChange}kg less assistance`
          : `${absoluteChange}kg more assistance`,
      amount: totalChange,
    });
  }

  return tags;
};
