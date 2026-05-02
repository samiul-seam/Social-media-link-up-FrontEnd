import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

const ImagePickerStrip = ({ images, onChange }) => {
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newUris = result.assets.map((a) => a.uri);
      onChange([...images, ...newUris]);
    }
  };

  const removeImage = (index) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
      <View className="flex-row gap-2 px-4">
        {/* Add button */}
        <TouchableOpacity
          onPress={pickImage}
          className="w-20 h-20 rounded-xl bg-gray-50 border border-dashed border-indigo-300 items-center justify-center"
        >
          <Ionicons name="add" size={22} color="#6366f1" />
          <Text className="text-indigo-400 text-xs mt-1">Add</Text>
        </TouchableOpacity>

        {/* Image previews */}
        {images.map((uri, index) => (
          <View key={index} className="relative">
            <Image
              source={{ uri }}
              className="w-20 h-20 rounded-xl"
              resizeMode="cover"
            />
            <TouchableOpacity
              onPress={() => removeImage(index)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white rounded-full items-center justify-center border border-gray-200"
            >
              <Ionicons name="close" size={11} color="#6b7280" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default ImagePickerStrip;