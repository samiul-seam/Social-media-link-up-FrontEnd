import { View, Text } from "react-native";

const Avatar = ({ initials, size = "md" }) => {
  const sizeClass = size === "sm" ? "w-8 h-8" : "w-11 h-11";
  const textClass = size === "sm" ? "text-xs" : "text-sm";
  return (
    <View className={`${sizeClass} rounded-full bg-indigo-900/60 items-center justify-center`}>
      <Text className={`${textClass} font-semibold text-indigo-300`}>{initials}</Text>
    </View>
  );
};

export default Avatar; 