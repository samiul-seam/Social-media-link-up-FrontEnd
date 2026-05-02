import { SafeAreaView } from 'react-native-safe-area-context'
import Navbar from '../../layouts/Navbar'
import NotificationSection from '../../components/Notification/NotificationSection'

export default function NotificationsScreen() {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <Navbar />
            <NotificationSection />
        </SafeAreaView>
    )
}