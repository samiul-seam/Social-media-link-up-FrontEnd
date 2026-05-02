import { useState } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";

const MOODS = [
  { id: "happy",      emoji: "😊", label: "Happy" },
  { id: "excited",    emoji: "🎉", label: "Excited" },
  { id: "thoughtful", emoji: "🤔", label: "Thoughtful" },
  { id: "grateful",   emoji: "🙏", label: "Grateful" },
  { id: "motivated",  emoji: "💪", label: "Motivated" },
  { id: "relaxed",    emoji: "😌", label: "Relaxed" },
  { id: "sad",        emoji: "😢", label: "Sad" },
  { id: "frustrated", emoji: "😤", label: "Frustrated" },
  { id: "creative",   emoji: "🎨", label: "Creative" },
  { id: "tired",      emoji: "😴", label: "Tired" },
  { id: "in_love",    emoji: "🥰", label: "In Love" },
  { id: "anxious",    emoji: "😰", label: "Anxious" },
];

const MoodPicker = ({ value, onChange }) => {
  const [visible, setVisible] = useState(false);
  const selected = MOODS.find((m) => m.id === value);

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        className="flex-row items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100"
      >
        <Text style={{ fontSize: 13 }}>{selected ? selected.emoji : "🙂"}</Text>
        <Text className="text-indigo-500 text-xs font-medium">
          {selected ? selected.label : "Mood"}
        </Text>
        {selected ? (
          <TouchableOpacity
            onPress={(e) => { e.stopPropagation(); onChange(null); }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text className="text-indigo-300 text-xs ml-0.5">✕</Text>
          </TouchableOpacity>
        ) : (
          <Text style={{ fontSize: 12, color: "#a5b4fc" }}>▾</Text>
        )}
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity
          className="flex-1 bg-black/30 justify-end"
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View className="bg-white rounded-t-2xl px-4 pt-4 pb-8 border-t border-gray-200">
            <Text className="text-gray-900 font-bold text-base mb-4">
              How are you feeling?
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {MOODS.map((mood) => (
                <TouchableOpacity
                  key={mood.id}
                  onPress={() => { onChange(mood.id); setVisible(false); }}
                  className={`flex-row items-center gap-1.5 px-3 py-2 rounded-full border ${
                    value === mood.id
                      ? "bg-indigo-50 border-indigo-300"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <Text style={{ fontSize: 15 }}>{mood.emoji}</Text>
                  <Text className={`text-xs font-medium ${
                    value === mood.id ? "text-indigo-600" : "text-gray-600"
                  }`}>
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default MoodPicker;