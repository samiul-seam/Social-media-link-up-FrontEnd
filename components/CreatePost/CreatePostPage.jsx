import { useState, useRef } from "react";
import {
    View,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Text,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AudiencePicker from "./AudiencePicker";
import MoodPicker from "./MoodPicker";
import ImagePickerStrip from "./ImagePickerStrip";
import authApiClient from "../../services/auth-api-client";

const CreatePostPage = ({ onClose, onPost }) => {
    const [caption, setCaption] = useState("");
    const [audience, setAudience] = useState("public");
    const [mood, setMood] = useState(null);
    const [images, setImages] = useState([]);
    const [isPosting, setIsPosting] = useState(false)
    const inputRef = useRef(null);

    const canPost = caption.trim().length > 0 || images.length > 0;

    const insertTag = (tag) => {
        const lastSpace = caption.endsWith(" ") || caption.length === 0;
        setCaption(caption + (lastSpace ? "" : " ") + tag + " ");
        inputRef.current?.focus();
    };

    const handlePost = async () => {
        if (!canPost || isPosting) return
        setIsPosting(true)

        try {
            const formData = new FormData()
            formData.append('caption', caption)
            formData.append('status', audience)
            if (mood) formData.append('mood_status', mood)

            images.forEach((image, index) => {
                formData.append('images', {
                    uri: image,
                    name: `photo_${index}.jpg`,
                    type: 'image/jpeg',
                })
            })


            const res = await authApiClient.post('/posts/', formData, {
                transformRequest: (data) => data,
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            })

            Alert.alert('Posted!', 'Your post is live.')
            onPost?.()
            onClose?.()
        } catch {
            Alert.alert('Error', 'Something went wrong. Please try again.')
        } finally {
            setIsPosting(false)
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                {/* Header */}
                <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
                    <TouchableOpacity onPress={onClose} className="p-1">
                        <Ionicons name="close" size={22} color="#9ca3af" />
                    </TouchableOpacity>
                    <Text className="text-gray-900 font-bold text-base">New Post</Text>
                    <TouchableOpacity
                        onPress={handlePost}
                        disabled={!canPost || isPosting}
                        className={`px-5 py-1.5 rounded-full ${canPost && !isPosting ? "bg-indigo-600" : "bg-gray-100 border border-gray-300"}`}
                    >
                        {isPosting ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Text className={`font-semibold text-sm ${canPost ? "text-white" : "text-gray-400"}`}>
                                Post
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
                    {/* Audience + Mood row */}
                    <View className="flex-row items-center gap-2 px-4 pt-4 flex-wrap">
                        <AudiencePicker value={audience} onChange={setAudience} />
                        <MoodPicker value={mood} onChange={setMood} />
                    </View>

                    {/* Caption input */}
                    <View className="bg-white rounded-lg m-3 border border-gray-300 min-h-48">
                        <TextInput
                            ref={inputRef}
                            className="text-gray-800 mx-4 mt-3 text-sm leading-6"
                            placeholder="Write a caption..."
                            placeholderTextColor="#9ca3af"
                            value={caption}
                            onChangeText={setCaption}
                            multiline
                            autoFocus
                            style={{ textAlignVertical: "top" }}
                        />
                    </View>

                    {/* Hashtag quick insert */}
                    {caption.length > 0 && (
                        <View className="flex-row gap-2 px-4 flex-wrap">
                            <TouchableOpacity
                                onPress={() => insertTag("#")}
                                className="flex-row items-center gap-1 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full"
                            >
                                <Text className="text-indigo-500 text-xs font-medium">#</Text>
                                <Text className="text-indigo-400 text-xs">hashtag</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Image picker strip */}
                    <ImagePickerStrip images={images} onChange={setImages} />

                    {/* Divider */}
                    <View className="h-px bg-gray-100 mx-4 mt-4" />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default CreatePostPage;