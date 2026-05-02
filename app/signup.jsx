import { useRouter } from "expo-router";
import SignupScreen from "../components/Auth/SignupScreen";

export default function Signup() {
    const router = useRouter();
    return (
        <SignupScreen
            onSignup={(data) => {
                router.replace("/(tabs)");
            }}
            onGoToLogin={() => router.back()}
        />
    );
}