import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams } from 'expo-router'
import ProfileScreen from '../components/Profile/ProfileScreen'
import useAuthContext from '../hooks/useAuthContext'

export default function UserProfileScreen() {
    const { userId } = useLocalSearchParams()
    const { user } = useAuthContext()

    const parsedId = Number(userId)

    const finalUserId = parsedId === user?.id ? null : parsedId

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ProfileScreen userId={finalUserId} />
        </SafeAreaView>
    )
}