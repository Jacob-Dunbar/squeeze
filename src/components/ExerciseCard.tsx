import { Pencil } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import Svg, { Polygon } from "react-native-svg";
import type { Exercise } from "../types/workout";
import PixelateEdges from "./PixelateEdges";
import RestDiamond from "./RestDiamond";
import SetLogger from "./SetLogger";
type SessionExercise = {
  weight: string;
  reps: string[];
};

type ExerciseCardProps = {
  exercise: Exercise;
  sessionExercise: SessionExercise;
  exerciseIndex: number;
  isOpen: boolean;
  submittedSets: number;
  onToggle: () => void;
  onUpdateWeight: (value: string) => void;
  onUpdateReps: (setIndex: number, value: string) => void;
  onSubmitSet: () => void;
};

export default function ExerciseCard({
  exercise,
  sessionExercise,
  isOpen,
  submittedSets,
  onToggle,
  onUpdateWeight,
  onUpdateReps,
  onSubmitSet,
}: ExerciseCardProps) {
  const lastSession = exercise.history[exercise.history.length - 1];

  const targetWeight = lastSession?.weight;

  const [restStarted, setRestStarted] = useState(0);

  const [editingWeight, setEditingWeight] = useState(false);

  const previousSessions = [...exercise.history].reverse().slice(0, 3);

  const [contentHeight, setContentHeight] = useState(0);

  const animatedHeight = useRef(new Animated.Value(0)).current;

  const formatDate = (date: string) => {
    const d = new Date(date);

    return `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1,
    ).padStart(2, "0")}/${String(d.getFullYear()).slice(-2)}`;
  };

  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: isOpen ? contentHeight : 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [isOpen, contentHeight]);

  return (
    <View>
      <Pressable onPress={onToggle}>
        <View className="relative flex flex-row items-center px-5 py-2 border-0 pixel-panel bg-primary/80">
          <PixelateEdges />
          <Text className="text-3xl !font-bold text-black/80 capitalize font-handjet-semibold">
            {exercise.name}
          </Text>
          {/* <Text className="text-xl text-black pixel-heading">
            {exercise.sets} X {exercise.reps} reps
          </Text> */}
          <Text className="!text-black/80 ml-2">{isOpen ? "▲" : "▼"}</Text>

          {submittedSets === exercise.sets && (
            <Text className="px-3 py-1 ml-auto text-xl font-bold tracking-wide text-black font-handjet-semibold">
              +20 XP
            </Text>
          )}
        </View>
      </Pressable>

      <View className="">
        <Animated.View
          style={{
            height: animatedHeight,
            overflow: "hidden",
          }}
        >
          <View
            className="p-5 !mx-1 -mt-1 pixel-panel"
            onLayout={(event) => {
              setContentHeight(event.nativeEvent.layout.height);
            }}
          >
            <PixelateEdges style="size-2 border-l-1 border-b-1 border-primary" />

            {/* History + weight */}

            <View className="flex flex-col">
              {/* <Text className=" pixel-label">Workout History</Text> */}

              {/* history */}
              <View className="flex-col-reverse">
                {previousSessions.map((session, index) => (
                  <View key={session.date} className="flex flex-row gap-5 pl-1">
                    <View
                      className={`flex items-center justify-center w-[2px] bg-primary/30 ${index === previousSessions.length - 1 ? "h-3/5 mt-auto" : "h-full"}`}
                    >
                      <View
                        className={`w-2 h-3 bg-black ${index === previousSessions.length - 1 ? "mb-auto" : "my-auto"}`}
                      >
                        <View className="w-full h-full bg-primary/40"></View>
                      </View>
                    </View>
                    <View className="flex flex-col flex-1 px-3 py-2 my-2 bg-primary/10">
                      <View className="flex flex-row gap-4">
                        {/* Weight */}
                        <Text className="text-xl text-primary/40 pixel-heading">
                          {session.weight}kg
                        </Text>
                        {/* <Text className="text-xl text-primary/40 pixel-heading">
                          {formatDate(session.date)}
                        </Text> */}

                        {/* Reps */}
                        <View className="flex-row flex-wrap">
                          {session.reps.map((reps, index) => (
                            <View key={index} className="">
                              <Text className="text-lg text-primary/60 pixel-heading">
                                {reps}
                                {index < session.reps.length - 1 && " · "}
                              </Text>
                            </View>
                          ))}
                        </View>

                        <Image
                          className="ml-auto opacity-60"
                          source={require("../../assets/UI/up.png")}
                        />
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              <View className="flex flex-row gap-5 pl-1">
                <View className="flex items-center justify-center w-[2px] mb-auto bg-primary/30 h-3">
                  {/* <View className="w-3 h-5 mt-auto bg-primary"></View> */}
                </View>
              </View>
              {/* todays session */}
              <View className="flex flex-col flex-1 w-full pixel-panel-inset ">
                <Text className="px-4 py-2 text-lg bg-primary/20 pixel-heading">
                  Todays Session
                </Text>

                <View className="flex flex-row justify-center flex-1 gap-6 mt-5 mb-3">
                  {/* TARGET REPS — DIAMOND */}
                  <View className="items-center gap-2">
                    <Text className="text-[10px] pixel-label">target</Text>

                    <View className="relative h-[76px] w-[76px] items-center justify-center">
                      <Svg
                        width={76}
                        height={76}
                        viewBox="0 0 76 76"
                        className="absolute"
                      >
                        <Polygon
                          points="38,2 74,38 38,74 2,38"
                          fill="#181818"
                          stroke="#444444"
                          strokeWidth={2}
                        />
                      </Svg>

                      <Text className="text-2xl pixel-heading">
                        {exercise.reps || "0"}
                      </Text>
                    </View>

                    <Text className="text-[10px] text-center pixel-label">
                      reps
                    </Text>
                  </View>
                  {/* WORKING WEIGHT — DIAMOND */}
                  <View className="items-center gap-2">
                    <View className="flex-row items-center gap-1">
                      <Text className="text-[10px] pixel-label">weight</Text>
                      <Pencil size={10} color="white" />
                    </View>

                    <Pressable
                      onPress={() => setEditingWeight(true)}
                      className="relative h-[76px] w-[76px] items-center justify-center"
                    >
                      <Svg
                        width={76}
                        height={76}
                        viewBox="0 0 76 76"
                        className="absolute"
                      >
                        <Polygon
                          points="38,2 74,38 38,74 2,38"
                          fill="#181818"
                          stroke="#444444"
                          strokeWidth={2}
                        />
                      </Svg>

                      {editingWeight ? (
                        <TextInput
                          autoFocus
                          value={sessionExercise.weight}
                          onChangeText={onUpdateWeight}
                          keyboardType="numbers-and-punctuation"
                          placeholder="0"
                          onBlur={() => setEditingWeight(false)}
                          selectionColor="green"
                          className="w-16 text-2xl text-center text-white pixel-heading"
                        />
                      ) : (
                        <Text className="text-2xl pixel-heading">
                          {sessionExercise.weight || "0"}
                        </Text>
                      )}
                    </Pressable>

                    <Text className="text-[10px] text-center pixel-label">
                      kg
                    </Text>
                  </View>
                  {/* rest */}
                  <RestDiamond rest={exercise.rest} restStarted={restStarted} />
                </View>

                <View className="p-4">
                  {/* Set logger */}
                  <SetLogger
                    lastWeekReps={previousSessions[0]?.reps ?? [0, 0, 0]}
                    sets={exercise.sets}
                    targetReps={exercise.reps}
                    reps={sessionExercise.reps}
                    submittedSets={submittedSets}
                    onUpdateReps={onUpdateReps}
                    onSubmitSet={() => {
                      onSubmitSet();
                      setRestStarted((previous) => previous + 1);
                    }}
                  />
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}
