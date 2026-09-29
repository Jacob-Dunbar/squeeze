import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Stack, router } from "expo-router";
import { useState } from "react";
import {
  Button,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { WORKOUT_ICON_OPTIONS } from "../constants/workoutIcons";
import { useUserStore } from "../store/userStore";
import { NewExercise } from "../types/workout";

export default function AddWorkout() {
  const addWorkout = useUserStore((state) => state.addWorkout);

  const [name, setName] = useState("");
  const [iconName, setIconName] = useState("dumbbell");
  const [frequency, setFrequency] = useState(1);
  const [exercises, setExercises] = useState<NewExercise[]>([]);

  const addExercise = () => {
    setExercises((current) => [
      ...current,
      {
        name: "",
        sets: 3,
        reps: 10,
        rest: 120,
        weight: 0,
        history: [],
      },
    ]);
  };

  const removeExercise = (index: number) => {
    setExercises((current) =>
      current.filter((_, exerciseIndex) => exerciseIndex !== index),
    );
  };

  const updateExercise = (
    index: number,
    field: keyof NewExercise,
    value: string,
  ) => {
    setExercises((current) =>
      current.map((exercise, exerciseIndex) => {
        if (exerciseIndex !== index) return exercise;

        if (field === "name") {
          return {
            ...exercise,
            name: value,
          };
        }

        return {
          ...exercise,
          [field]: Number(value),
        };
      }),
    );
  };

  const handleCreateWorkout = () => {
    if (!name.trim() || exercises.length === 0) return;

    addWorkout({
      name: name.trim(),
      frequency: frequency,
      icon: iconName,
      exercises,
    });

    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ title: "Add Workout" }} />

      <ScrollView contentContainerStyle={styles.container}>
        <Button title="Back" onPress={() => router.back()} />

        <Text style={styles.label}>Workout name</Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Chest"
          style={styles.input}
        />

        <Text style={styles.label}>Workout icon</Text>
        <View style={styles.iconGrid}>
          {WORKOUT_ICON_OPTIONS.map((option) => {
            const selected = option.name === iconName;

            return (
              <Pressable
                key={option.name}
                accessibilityRole="radio"
                accessibilityLabel={option.label}
                accessibilityState={{ checked: selected }}
                onPress={() => setIconName(option.name)}
                style={[
                  styles.iconOption,
                  selected && styles.iconOptionSelected,
                ]}
              >
                <FontAwesomeIcon
                  icon={option.icon}
                  color={selected ? "#C3F400" : "#C4C9AC"}
                  size={19}
                />
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={[
                    styles.iconOptionLabel,
                    selected && styles.iconOptionLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Frequency</Text>

        <TextInput
          value={String(frequency)}
          onChangeText={(value) => setFrequency(Number(value))}
          placeholder="1"
          keyboardType="number-pad"
          inputMode="numeric"
          style={styles.input}
        />

        <Text style={styles.sectionTitle}>Exercises</Text>

        {exercises.length === 0 && (
          <Text style={styles.emptyText}>No exercises added yet.</Text>
        )}

        {exercises.map((exercise, index) => (
          <View style={styles.exerciseCard} key={index}>
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseTitle}>Exercise {index + 1}</Text>

              <Button title="Delete" onPress={() => removeExercise(index)} />
            </View>

            <Text style={styles.label}>Exercise name</Text>

            <TextInput
              value={exercise.name}
              onChangeText={(value) => updateExercise(index, "name", value)}
              placeholder="e.g. Bench Press"
              style={styles.input}
            />

            <View style={styles.row}>
              <View style={styles.half}>
                <Text style={styles.label}>Sets</Text>
                <TextInput
                  value={String(exercise.sets)}
                  onChangeText={(value) => updateExercise(index, "sets", value)}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>

              <View style={styles.half}>
                <Text style={styles.label}>Reps</Text>
                <TextInput
                  value={String(exercise.reps)}
                  onChangeText={(value) => updateExercise(index, "reps", value)}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>

              <View style={styles.half}>
                <Text style={styles.label}>Rest (seconds)</Text>
                <TextInput
                  value={String(exercise.rest)}
                  onChangeText={(value) => updateExercise(index, "rest", value)}
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
            </View>
          </View>
        ))}

        <Button title="+ Add Exercise" onPress={addExercise} />

        <Button
          title="Create Workout"
          onPress={handleCreateWorkout}
          disabled={!name.trim() || exercises.length === 0}
        />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    padding: 16,
  },

  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 8,
  },

  emptyText: {
    color: "grey",
  },

  exerciseCard: {
    gap: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
  },

  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  exerciseTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },

  row: {
    flexDirection: "row",
    gap: 12,
  },

  half: {
    flex: 1,
  },

  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 8,
  },

  iconOption: {
    width: "23.5%",
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(196,201,172,0.18)",
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.03)",
  },

  iconOptionSelected: {
    borderColor: "rgba(195,244,0,0.8)",
    backgroundColor: "rgba(195,244,0,0.1)",
  },

  iconOptionLabel: {
    maxWidth: "90%",
    color: "#C4C9AC",
    fontSize: 9,
  },

  iconOptionLabelSelected: {
    color: "#C3F400",
  },
});
