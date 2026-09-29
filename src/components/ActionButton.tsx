import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Pressable, Text } from "react-native";

type ActionButtonProps = {
  label: string;
  icon?: IconProp;
  color: string;
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  className?: string;
};

export default function ActionButton({
  label,
  icon,
  color,
  onPress,
  disabled = false,
  accessibilityLabel,
  className = "",
}: ActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`min-h-11 flex-row items-center justify-center gap-2 rounded-lg border px-4 py-3 active:opacity-80 ${className}`}
      style={{
        backgroundColor: disabled ? "rgba(255,255,255,0.06)" : color,
        borderColor: disabled ? "rgba(255,255,255,0.08)" : color,
      }}
    >
      {icon && (
        <FontAwesomeIcon
          icon={icon}
          color={disabled ? "#737765" : "#181B25"}
          size={14}
        />
      )}
      <Text
        className="text-xs font-bold tracking-wider uppercase font-grotesk"
        style={{ color: disabled ? "#737765" : "#181B25" }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
