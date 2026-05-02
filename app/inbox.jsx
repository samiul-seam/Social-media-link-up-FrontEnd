import { SafeAreaView } from "react-native-safe-area-context";
import InboxSection from "../components/Inbox/InboxSection";

export default function Inbox() {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <InboxSection />
        </SafeAreaView>
    )
}