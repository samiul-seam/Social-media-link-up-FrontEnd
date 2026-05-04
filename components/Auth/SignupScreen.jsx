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
import { useForm, Controller } from "react-hook-form";
import useAuthContext from "../../hooks/useAuthContext";

const Field = ({ label, icon, error, children }) => {
    const borderColor = error ? "border-red-400" : "border-gray-200";
    return (
        <View className="mb-4">
            <Text className="text-gray-700 text-sm font-medium mb-1.5">
                {label}
            </Text>
            <View className={`flex-row items-center bg-gray-50 border rounded-xl px-4 gap-2 ${borderColor}`}>
                <Ionicons name={icon} size={17} color="#9ca3af" />
                {children}
            </View>
            {error && (
                <Text className="text-red-400 text-xs mt-1">
                    {error.message}
                </Text>
            )}
        </View>
    );
};

export default function SignupScreen({ onGoToLogin }) {
    const { registerUser } = useAuthContext()
    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const password = watch("password")

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            const result = await registerUser({
                first_name: data.firstName,
                last_name: data.lastName,
                email: data.email,
                password: data.password,
                re_password: data.confirmPassword
            })
            if (result.success) {
                Alert.alert('Success! 🎉', 'Account created! Please login.', [
                    { text: 'OK', onPress: onGoToLogin }
                ])
            } else {
                Alert.alert('Error', result.message || 'Registration failed')
            }
        } catch {
            Alert.alert('Error', 'Something went wrong')
        } finally {
            setLoading(false)
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View className="px-6 pt-12 pb-8">

                        {/* Header */}
                        <View className="mb-8">
                            <View className="w-14 h-14 bg-indigo-600 rounded-2xl items-center justify-center mb-5">
                                <Ionicons name="sparkles" size={26} color="#fff" />
                            </View>
                            <Text className="text-gray-900 text-3xl font-bold mb-1">
                                Create account
                            </Text>
                            <Text className="text-gray-400 text-sm">
                                Join and start sharing
                            </Text>
                        </View>

                        {/* First Name */}
                        <Field label="First Name" icon="person-outline" error={errors.firstName}>
                            <Controller
                                control={control}
                                name="firstName"
                                rules={{ required: "First name is required" }}
                                render={({ field: { onChange, value } }) => (
                                    <TextInput
                                        className="flex-1 py-3.5 text-gray-800 text-sm"
                                        placeholder="John"
                                        value={value}
                                        onChangeText={onChange}
                                        autoCapitalize="words"
                                        blurOnSubmit={false}
                                        returnKeyType="next"
                                    />
                                )}
                            />
                        </Field>

                        {/* Last Name */}
                        <Field label="Last Name" icon="person-outline" error={errors.lastName}>
                            <Controller
                                control={control}
                                name="lastName"
                                rules={{ required: "Last name is required" }}
                                render={({ field: { onChange, value } }) => (
                                    <TextInput
                                        className="flex-1 py-3.5 text-gray-800 text-sm"
                                        placeholder="Doe"
                                        value={value}
                                        onChangeText={onChange}
                                        autoCapitalize="words"
                                        blurOnSubmit={false}
                                        returnKeyType="next"
                                    />
                                )}
                            />
                        </Field>

                        {/* Email */}
                        <Field label="Email" icon="mail-outline" error={errors.email}>
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
                                    <TextInput
                                        className="flex-1 py-3.5 text-gray-800 text-sm"
                                        placeholder="you@example.com"
                                        value={value}
                                        onChangeText={onChange}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        blurOnSubmit={false}
                                        returnKeyType="next"
                                    />
                                )}
                            />
                        </Field>

                        {/* Password */}
                        <Field label="Password" icon="shield-checkmark-outline" error={errors.password}>
                            <Controller
                                control={control}
                                name="password"
                                rules={{ required: "Please write your password" }}
                                render={({ field: { onChange, value } }) => (
                                    <>
                                        <TextInput
                                            className="flex-1 py-3.5 text-gray-800 text-sm"
                                            placeholder="Write your password"
                                            value={value}
                                            onChangeText={onChange}
                                            secureTextEntry={!showPassword}
                                            blurOnSubmit={false}
                                            returnKeyType="next"
                                        />
                                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                            <Ionicons
                                                name={showPassword ? "eye-off-outline" : "eye-outline"}
                                                size={17}
                                                color="#9ca3af"
                                            />
                                        </TouchableOpacity>
                                    </>
                                )}
                            />
                        </Field>

                        {/* Confirm Password */}
                        <Field label="Confirm Password" icon="shield-checkmark-outline" error={errors.confirmPassword}>
                            <Controller
                                control={control}
                                name="confirmPassword"
                                rules={{
                                    required: "Please confirm your password",
                                    validate: (value) =>
                                        value === password || "Passwords don't match",
                                }}
                                render={({ field: { onChange, value } }) => (
                                    <>
                                        <TextInput
                                            className="flex-1 py-3.5 text-gray-800 text-sm"
                                            placeholder="Repeat your password"
                                            value={value}
                                            onChangeText={onChange}
                                            secureTextEntry={!showPassword}
                                            blurOnSubmit={false}
                                            returnKeyType="done"
                                        />
                                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                            <Ionicons
                                                name={showPassword ? "eye-off-outline" : "eye-outline"}
                                                size={17}
                                                color="#9ca3af"
                                            />
                                        </TouchableOpacity>
                                    </>
                                )}
                            />
                        </Field>

                        {/* Button */}
                        <TouchableOpacity
                            onPress={handleSubmit(onSubmit)}
                            disabled={loading}
                            className={`rounded-xl py-4 items-center mt-2 ${loading ? 'bg-indigo-300' : 'bg-indigo-600'}`}
                        >
                            <Text className="text-white font-semibold text-sm">
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </Text>
                        </TouchableOpacity>

                        {/* Footer */}
                        <View className="flex-row justify-center mt-8">
                            <Text className="text-gray-400 text-sm">
                                Already have an account?{" "}
                            </Text>
                            <TouchableOpacity onPress={onGoToLogin}>
                                <Text className="text-indigo-500 font-semibold">
                                    Sign In
                                </Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}