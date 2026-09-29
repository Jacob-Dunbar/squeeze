import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useRef, useState } from "react";
import { Animated, Pressable, ScrollView, Text, View } from "react-native";
import { colors } from "../constants/colors";
import type { HistoryType } from "../types/workout";

type ExerciseHistoryProps = {
  sessions: HistoryType[];
  targetReps: number;
};

const formatTimeAgo = (dateString: string) => {
  const ageInDays = Math.max(
    0,
    Math.floor((Date.now() - new Date(dateString).getTime()) / 86400000),
  );

  if (ageInDays < 30) {
    return `${ageInDays}d ago`;
  }

  const ageInMonths = Math.floor(ageInDays / 30);

  if (ageInMonths < 12) {
    return `${ageInMonths}m ago`;
  }

  return `${Math.floor(ageInMonths / 12)}y ago`;
};

const getAverageSetVolume = (session: HistoryType) => {
  if (session.reps.length === 0) return 0;

  const totalVolume = session.reps.reduce(
    (total, reps) => total + session.weight * reps,
    0,
  );

  return totalVolume / session.reps.length;
};

const getSessionWeight = (session: HistoryType) => {
  const weight = Number(session.weight);
  return Number.isFinite(weight) ? weight : 0;
};

const getSessionVolume = (session: HistoryType) => {
  const weight = getSessionWeight(session);
  return session.reps.reduce((total, reps) => total + weight * reps, 0);
};

const getTotalReps = (session: HistoryType) =>
  session.reps.reduce((total, reps) => total + reps, 0);

export default function ExerciseHistory({
  sessions,
  targetReps,
}: ExerciseHistoryProps) {
  const maximumReps = Math.max(1, targetReps + 2);
  const recentSessions = sessions.slice(0, 4);
  const latestSession = recentSessions[0];
  const baselineSession = recentSessions[3];
  const hasFourSessions = recentSessions.length === 4;
  const latestWeight = latestSession ? getSessionWeight(latestSession) : 0;
  const baselineWeight = baselineSession
    ? getSessionWeight(baselineSession)
    : 0;
  const allSessionsUnweighted =
    hasFourSessions &&
    recentSessions.every((session) => getSessionWeight(session) === 0);
  const weightAdded =
    hasFourSessions && baselineWeight === 0 && latestWeight > 0;
  const hasRepBasedComparison = allSessionsUnweighted;
  const baselineValue = baselineSession
    ? hasRepBasedComparison
      ? getTotalReps(baselineSession)
      : getSessionVolume(baselineSession)
    : 0;
  const latestValue = latestSession
    ? hasRepBasedComparison
      ? getTotalReps(latestSession)
      : getSessionVolume(latestSession)
    : 0;
  const canShowChange = hasFourSessions && (weightAdded || baselineValue > 0);
  const changePercent =
    canShowChange && !weightAdded
      ? Math.round(((latestValue - baselineValue) / baselineValue) * 100)
      : 0;
  const addedWeight = Number((latestWeight - baselineWeight).toFixed(2));
  const changeLabel = weightAdded
    ? `+ ${addedWeight}kg`
    : `${changePercent > 0 ? "+" : ""}${changePercent}% vol`;
  const valueIncreased = weightAdded || changePercent > 0;
  const valueDecreased = changePercent < 0;
  const [historyExpanded, setHistoryExpanded] = useState(true);
  const historyHeight = useRef(new Animated.Value(0)).current;
  const measuredHeight = useRef(0);
  const hasMeasuredHeight = useRef(false);

  const toggleHistory = () => {
    const nextExpanded = !historyExpanded;
    setHistoryExpanded(nextExpanded);
    historyHeight.stopAnimation();
    Animated.timing(historyHeight, {
      toValue: nextExpanded ? measuredHeight.current : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const measureHistory = (event: {
    nativeEvent: { layout: { height: number } };
  }) => {
    const nextHeight = event.nativeEvent.layout.height;
    if (nextHeight <= 0) return;

    measuredHeight.current = nextHeight;
    if (!hasMeasuredHeight.current) {
      historyHeight.setValue(nextHeight);
      hasMeasuredHeight.current = true;
    }
  };

  return (
    <View className="flex-grow-0 w-full rounded-xl bg-white/5">
      <View className="flex flex-row justify-between">
        <View className="flex-row items-center gap-2 p-4 pb-3">
          <Text className="tracking-wider text-white uppercase font-liberation">
            History
          </Text>
          {canShowChange && (
            <View
              accessibilityLabel={
                weightAdded
                  ? `${addedWeight} kilograms added`
                  : `Total volume change ${changeLabel}`
              }
              className={`px-2 py-1  rounded-md ${
                valueIncreased
                  ? " bg-primary/10"
                  : valueDecreased
                    ? " bg-red-500/10"
                    : " bg-white/5"
              }`}
            >
              <Text
                className={`text-xs font-liberation ${
                  valueIncreased
                    ? "text-primary"
                    : valueDecreased
                      ? "text-red-400"
                      : "text-lightText"
                }`}
              >
                {changeLabel}
              </Text>
            </View>
          )}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: historyExpanded }}
          onPress={toggleHistory}
          className="p-4 pb-3 tracking-wider uppercase text-primary font-liberation"
        >
          <Text className="text-xs text-primary/80 font-liberation">
            {historyExpanded ? "Hide" : "Show"}
          </Text>
        </Pressable>
      </View>

      {historyExpanded && <View className="h-[1px] bg-white/10 mx-4 mb-2" />}
      <Animated.View style={{ height: historyHeight, overflow: "hidden" }}>
        <View onLayout={measureHistory} style={{ flexShrink: 0 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="flex-row gap-3 p-3"
          >
            {sessions.map((session, sessionIndex) => (
              <View key={session.date} className="shrink-0">
                <View className="relative flex flex-col self-start px-3 py-2 rounded-xl bg-tertiary">
                  {sessions[sessionIndex + 1] &&
                    (() => {
                      const change =
                        getAverageSetVolume(session) -
                        getAverageSetVolume(sessions[sessionIndex + 1]);

                      if (change === 0) return null;

                      return (
                        <View
                          accessibilityLabel={
                            change > 0
                              ? "Average set volume increased"
                              : "Average set volume decreased"
                          }
                          className="absolute items-center justify-center rounded-full top-2 right-1 size-6 bg-black/20"
                        >
                          <Text
                            className={`text-xs font-bold ${
                              change > 0 ? "text-primary" : "text-red-500/70"
                            }`}
                          >
                            {change > 0 ? "▲" : "▼"}
                          </Text>
                        </View>
                      );
                    })()}

                  {/* Date ----------------------*/}
                  <Text className="mr-6 text-white font-grotesk">
                    {new Date(session.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                    })}
                  </Text>
                  <Text className="text-xs text-lightText font-liberation ">
                    {formatTimeAgo(session.date)}
                  </Text>

                  {/* Bars ----------------------*/}
                  <View className="flex-row gap-[5px] h-20 p-2 rounded-md my-2 mx-auto bg-black/20">
                    {session.reps.map((reps, repIndex) => {
                      const clampedReps = Math.min(
                        Math.max(reps, 0),
                        maximumReps,
                      );
                      const height = 15 + (clampedReps / maximumReps) * 30;
                      const previousReps =
                        sessions[sessionIndex + 1]?.reps[repIndex];
                      const isBelowPrevious =
                        reps < targetReps &&
                        previousReps !== undefined &&
                        reps < previousReps;

                      return (
                        <View
                          className="flex flex-col items-center justify-end gap-1"
                          key={repIndex}
                        >
                          <Text
                            className={`font-liberation text-xs ${
                              reps > targetReps
                                ? "text-primary"
                                : "text-lightText"
                            }`}
                          >
                            {reps}
                          </Text>
                          <View
                            className={`w-[22px] rounded-t-md ${
                              reps === targetReps
                                ? "bg-primary/60"
                                : reps > targetReps
                                  ? "bg-primary"
                                  : isBelowPrevious
                                    ? "bg-red-500/30"
                                    : "bg-white/10"
                            }`}
                            style={{ height }}
                          />
                        </View>
                      );
                    })}
                  </View>

                  {/* Weight ----------------------*/}
                  <View className="flex-row items-center gap-2">
                    <View className="rotate-45">
                      <FontAwesomeIcon
                        icon="dumbbell"
                        color={colors.lightText}
                        size={16}
                      />
                    </View>

                    <Text className="text-2xl text-white font-grotesk">
                      {session.weight}{" "}
                      <span className="text-xs uppercase text-lightText">
                        kg
                      </span>
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </Animated.View>
    </View>
  );
}
