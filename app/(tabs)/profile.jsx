import { SafeAreaView } from 'react-native-safe-area-context'
import ProfileScreen from '../../components/Profile/ProfileScreen'

export default function UserProfileScreen() {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <ProfileScreen />
        </SafeAreaView>
    )
}