import { Text, TouchableOpacity, View } from 'react-native'
import { Image } from 'expo-image'
import { router } from 'expo-router'
import defaultImg from '../../assets/default_img.jpg'
import authApiClient from '../../services/auth-api-client'

const NOTIFICATION_ICONS = {
    reply: '💬',
    like: '❤️',
    comment: '🗨️',
    follow: '👤',
}

const NotificationCard = ({ item }) => {
    const formattedTime = new Date(item.created_at).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })

    const handlePress = async () => {
        if (!item.is_read) {
            await authApiClient.patch(`/notification/${item.id}/`, { is_read: true })
        }

        switch (item.notification_type) {
            case 'like':
                const res = await authApiClient.get(`/posts/${item.post_id}/`)
                router.push({
                    pathname: '/PostDetailScreen',
                    params: { post: JSON.stringify(res.data) }
                })
                break
            case 'comment':
            case 'reply':
                const commentRes = await authApiClient.get(`/posts/${item.post_id}/`)
                router.push({
                    pathname: '/comments',
                    params: { id: item.post_id, post: JSON.stringify(commentRes.data) }
                })
                break
            case 'follow':
                router.push({
                    pathname: `/UserProfile`,
                    params: { userId: item.sender }
                })
                break
            default:
                break
        }
    }

    return (
        <TouchableOpacity
            onPress={handlePress}
            className={`flex-row items-center px-4 py-3 ${!item.is_read ? 'bg-blue-50' : 'bg-white'}`}
        >
            {/* Avatar */}
            <View className="relative">
                <Image
                    source={item.sender_profile ? { uri: item.sender_profile } : defaultImg}
                    style={{ width: 48, height: 48, borderRadius: 24 }}
                />
                <View className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                    <Text className="text-xs">{NOTIFICATION_ICONS[item.notification_type] ?? '🔔'}</Text>
                </View>
            </View>

            {/* Message */}
            <View className="flex-1 ml-3">
                <Text className="text-gray-800 text-sm">
                    <Text className="font-bold">{item.sender_name} </Text>
                    {item.text}
                </Text>
                <Text className="text-gray-400 text-xs mt-0.5">{formattedTime}</Text>
            </View>

            {/* Unread dot */}
            {!item.is_read && (
                <View className="w-2.5 h-2.5 rounded-full bg-blue-500 ml-2" />
            )}
        </TouchableOpacity>
    )
}

export default NotificationCard