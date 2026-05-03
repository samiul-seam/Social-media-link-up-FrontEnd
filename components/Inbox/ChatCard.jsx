import { Image } from 'expo-image'
import { Text, View, TouchableOpacity } from 'react-native'
import defaultImg from '../../assets/default_img.jpg'

const formatTime = (isoString) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    if (isToday) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

const ChatCard = ({ item, currentUserId, onLongPress, onPress }) => {
    const { other_user, last_message, updated_at, unread_count } = item
    const hasUnread = unread_count > 0 || (!last_message?.is_read && last_message?.sender_id !== currentUserId)

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            onLongPress={() => onLongPress?.(item)}
            delayLongPress={350}
        >
            <View className="flex-row items-center px-4 py-3 bg-white">
                <View className="relative">
                    <Image
                        source={other_user.profile_picture ? { uri: other_user.profile_picture } : defaultImg}
                        style={{ width: 55, height: 55, borderRadius: 27.5 }}
                        contentFit="cover"
                        transition={200}
                    />
                    <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
                </View>

                <View className="flex-1 ml-3 pr-2">
                    <View className="flex-row justify-between items-center">
                        <Text
                            numberOfLines={1}
                            className={`text-base flex-1 ${hasUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}
                        >
                            {other_user.full_name}
                        </Text>
                        <Text className="text-[11px] text-gray-400 ml-2">
                            {formatTime(last_message?.created_at ?? updated_at)}
                        </Text>
                    </View>

                    <View className="flex-row items-center justify-between mt-0.5">
                        <Text
                            numberOfLines={1}
                            className={`text-sm flex-1 ${hasUnread ? 'text-gray-900 font-medium' : 'text-gray-500'}`}
                        >
                            {last_message?.sender_id === currentUserId && (
                                <Text className="text-gray-400">You: </Text>
                            )}
                            {last_message?.message ?? 'No messages yet'}
                        </Text>

                        {hasUnread && (
                            <View className="bg-blue-500 rounded-full min-w-[20px] h-5 items-center justify-center ml-2 px-1">
                                <Text className="text-white text-xs font-bold">
                                    {unread_count > 0 ? (unread_count > 99 ? '99+' : unread_count) : '•'}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )
}

export default ChatCard