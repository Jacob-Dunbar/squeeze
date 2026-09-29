import { Text, View } from "react-native";

type TagType = "primary" | "secondary" | "tertiary" | "neutral";
type TagSize = "compact" | "small";

type TagProps = {
  label: string;
  type: TagType;
  size?: TagSize;
  accessibilityLabel?: string;
};

const typeClasses: Record<TagType, { container: string; text: string }> = {
  primary: {
    container: "border-primary/20 bg-primary/10",
    text: "text-primary",
  },
  secondary: {
    container: "border-secondary/20 bg-secondary/10",
    text: "text-secondary",
  },
  tertiary: {
    container: "border-tertiary/20 bg-tertiary/10",
    text: "text-tertiary",
  },
  neutral: {
    container: "border-white/10 bg-white/5",
    text: "text-lightText",
  },
};

const sizeClasses: Record<TagSize, { container: string; text: string }> = {
  compact: { container: "px-2 py-1", text: "text-[10px]" },
  small: { container: "px-2 py-1", text: "text-xs" },
};

export default function Tag({
  label,
  type,
  size = "compact",
  accessibilityLabel,
}: TagProps) {
  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel ?? label}
      className={`flex-row items-center gap-1 rounded-md border ${typeClasses[type].container} ${sizeClasses[size].container}`}
    >
      <Text
        className={`${sizeClasses[size].text} font-liberation ${typeClasses[type].text}`}
      >
        {label}
      </Text>
    </View>
  );
}
