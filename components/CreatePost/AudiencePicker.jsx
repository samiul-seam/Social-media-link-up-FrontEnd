import { useState } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const AUDIENCE_OPTIONS = [
  { id: "public", label: "Public", desc: "Anyone can see this post", icon: "globe-outline" },
  { id: "followers", label: "Followers", desc: "Only your followers", icon: "people-outline" },
  { id: "only_me", label: "Only Me", desc: "Just you", icon: "lock-closed-outline" },
];

const AudiencePicker = ({ value, onChange }) => {
  const [visible, setVisible] = useState(false);
  const selected = AUDIENCE_OPTIONS.find((o) => o.id === value);

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        className="flex-row items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100"
      >
        <Ionicons name={selected.icon} size={13} color="#6366f1" />
        <Text className="text-indigo-500 text-xs font-medium">{selected.label}</Text>
        <Ionicons name="chevron-down" size={12} color="#a5b4fc" />
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity
          className="flex-1 bg-black/30 justify-end"
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View className="bg-white rounded-t-2xl px-4 pt-4 pb-8 border-t border-gray-200">
            <Text className="text-gray-900 font-bold text-base mb-4">Who can see this?</Text>
            {AUDIENCE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                onPress={() => { onChange(opt.id); setVisible(false); }}
                className={`flex-row items-center gap-3 py-3 px-3 rounded-xl mb-1 ${
                  value === opt.id
                    ? "bg-indigo-50 border border-indigo-200"
                    : "border border-transparent"
                }`}
              >
                <View className={`w-9 h-9 rounded-full items-center justify-center ${
                  value === opt.id ? "bg-indigo-100" : "bg-gray-100"
                }`}>
                  <Ionicons
                    name={opt.icon}
                    size={18}
                    color={value === opt.id ? "#6366f1" : "#9ca3af"}
                  />
                </View>
                <View className="flex-1">
                  <Text className={`font-semibold text-sm ${
                    value === opt.id ? "text-indigo-600" : "text-gray-800"
                  }`}>
                    {opt.label}
                  </Text>
                  <Text className="text-gray-400 text-xs mt-0.5">{opt.desc}</Text>
                </View>
                {value === opt.id && (
                  <Ionicons name="checkmark-circle" size={18} color="#6366f1" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default AudiencePicker;