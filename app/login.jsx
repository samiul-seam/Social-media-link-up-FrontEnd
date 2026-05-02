import { useRouter } from "expo-router";
import LoginScreen from "../components/Auth/LoginScreen";

export default function Login() {
    const router = useRouter();
    return (
        <LoginScreen
            onLogin={(data) => {
                router.replace("/(tabs)");
            }}
            onGoToSignup={() => router.push("/signup")}
        />
    );
}