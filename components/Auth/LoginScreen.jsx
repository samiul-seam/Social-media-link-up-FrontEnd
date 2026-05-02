import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import useAuthContext from "../../hooks/useAuthContext";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";

const LoginScreen = ({ onGoToSignup }) => {
    const [showPassword, setShowPassword] = useState(false);
    const { loginUser, loading, errorMsg } = useAuthContext();

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const handleLogin = async (data) => {
        const result = await loginUser({
            email: data.email,
            password: data.password,
        });

        if (result?.success) {
            router.replace("/");
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                {errorMsg &&
                    <View>
                        <Text className="text-gray-700">
                            {errorMsg}
                        </Text>
                    </View>
                }
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View className="flex-1 px-6 pt-12 pb-8 justify-between">

                        {/* Top section */}
                        <View>
                            {/* Logo */}
                            <View className="mb-10">
                                <View className="w-14 h-14 bg-indigo-600 rounded-2xl items-center justify-center mb-5">
                                    <Ionicons name="sparkles" size={26} color="#fff" />
                                </View>
                                <Text className="text-gray-900 text-3xl font-bold mb-1">
                                    Welcome back
                                </Text>
                                <Text className="text-gray-400 text-sm">
                                    Sign in to continue
                                </Text>
                            </View>

                            {/* Email */}
                            <View className="mb-4">
                                <Text className="text-gray-700 text-sm font-medium mb-1.5">
                                    Email
                                </Text>

                                <Controller
                                    control={control}
                                    name="email"
                                    rules={{
                                        required: "Email is required",
                                        pattern: {
                                            value: /\S+@\S+\.\S+/,
                                            message: "Enter a valid email",
                                        },
                                    }}
                                    render={({ field: { onChange, value } }) => (
                                        <View
                                            className={`flex-row items-center bg-gray-50 border rounded-xl px-4 gap-2 ${errors.email
                                                ? "border-red-400"
                                                : "border-gray-200"
                                                }`}
                                        >
                                            <Ionicons
                                                name="mail-outline"
                                                size={17}
                                                color="#9ca3af"
                                            />
                                            <TextInput
                                                className="flex-1 py-3.5 pl-2 text-gray-800 text-sm"
                                                placeholder="you@example.com"
                                                placeholderTextColor="#9ca3af"
                                                value={value}
                                                onChangeText={onChange}
                                                keyboardType="email-address"
                                                autoCapitalize="none"
                                                autoCorrect={false}
                                            />
                                        </View>
                                    )}
                                />

                                {errors.email && (
                                    <Text className="text-red-400 text-xs mt-1">
                                        {errors.email.message}
                                    </Text>
                                )}
                            </View>

                            {/* Password */}
                            <View className="mb-2">
                                <Text className="text-gray-700 text-sm font-medium mb-1.5">
                                    Password
                                </Text>

                                <Controller
                                    control={control}
                                    name="password"
                                    rules={{
                                        required: "Password is required",
                                        minLength: {
                                            value: 6,
                                            message: "Minimum 6 characters",
                                        },
                                    }}
                                    render={({ field: { onChange, value } }) => (
                                        <View
                                            className={`flex-row items-center bg-gray-50 border rounded-xl px-4 gap-2 ${errors.password
                                                ? "border-red-400"
                                                : "border-gray-200"
                                                }`}
                                        >
                                            <Ionicons
                                                name="lock-closed-outline"
                                                size={17}
                                                color="#9ca3af"
                                            />
                                            <TextInput
                                                className="flex-1 py-3.5 pl-2 text-gray-800 text-sm"
                                                placeholder="Enter your password"
                                                placeholderTextColor="#9ca3af"
                                                value={value}
                                                onChangeText={onChange}
                                                secureTextEntry={!showPassword}
                                                autoCapitalize="none"
                                            />
                                            <TouchableOpacity
                                                onPress={() =>
                                                    setShowPassword((p) => !p)
                                                }
                                            >
                                                <Ionicons
                                                    name={
                                                        showPassword
                                                            ? "eye-off-outline"
                                                            : "eye-outline"
                                                    }
                                                    size={17}
                                                    color="#9ca3af"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                />

                                {errors.password && (
                                    <Text className="text-red-400 text-xs mt-1">
                                        {errors.password.message}
                                    </Text>
                                )}
                            </View>

                            {/* Forgot */}
                            <TouchableOpacity
                                className="self-end mb-6"
                                onPress={() =>
                                    Alert.alert(
                                        "Reset Password",
                                        "Check your email for a reset link."
                                    )
                                }
                            >
                                <Text className="text-indigo-500 text-xs font-medium">
                                    Forgot password?
                                </Text>
                            </TouchableOpacity>

                            {/* Login */}
                            <TouchableOpacity
                                onPress={handleSubmit(handleLogin)}
                                disabled={loading}
                                className={`bg-indigo-600 rounded-xl py-4 items-center ${loading ? "opacity-60" : ""
                                    }`}
                            >
                                <Text className="text-white font-semibold text-sm">
                                    {loading ? "Signing in..." : "Sign In"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Bottom */}
                        <View className="flex-row justify-center items-center mt-8">
                            <Text className="text-gray-400 text-sm">
                                Don&apos;t have an account?{" "}
                            </Text>
                            <TouchableOpacity onPress={onGoToSignup}>
                                <Text className="text-indigo-500 text-sm font-semibold">
                                    Sign Up
                                </Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default LoginScreen;