import { Text, View, TouchableOpacity } from 'react-native'
import { Image } from 'expo-image'
import defaultImg from '../../assets/default_img.jpg'

const Message = ({ item, currentUserId, isFirst, isLast, onEditRequest }) => {
    const sender = item?.sender_profile || {}
    const isMe = Number(sender?.id) === Number(currentUserId)

    const time = item?.created_at
        ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : ''

    const avatar = sender?.profile_picture ? { uri: sender.profile_picture } : defaultImg

    if (isMe) {
        return (
            <View className={`w-full flex-row justify-end items-end px-2 ${isLast ? 'mb-3' : 'mb-0.5'}`}>
                {isLast && <Text className="text-[10px] text-gray-400 mr-1 mb-1">{time}</Text>}
                <View className="max-w-[70%]">
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onLongPress={() => onEditRequest?.(item)}
                        delayLongPress={350}
                    >
                        <View className={`bg-blue-500 px-4 py-2 rounded-2xl ${isLast ? 'rounded-br-sm' : 'rounded-br-2xl'}`}>
                            <Text className="text-white text-[15px]">{item?.message}</Text>
                            {item?.is_edited && (
                                <Text className="text-blue-200 text-[10px] text-right mt-0.5">edited</Text>
                            )}
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    return (
        <View className={`w-full flex-row justify-start items-end px-2 ${isLast ? 'mb-3' : 'mb-0.5'}`}>
            <View className="w-8 mr-2">
                {isLast && <Image source={avatar} style={{ width: 32, height: 32, borderRadius: 16 }} />}
            </View>
            <View className="max-w-[70%]">
                <View className={`bg-gray-100 px-4 py-2 rounded-2xl ${isLast ? 'rounded-bl-sm' : 'rounded-bl-2xl'}`}>
                    <Text className="text-gray-800 text-[15px]">{item?.message}</Text>
                    {item?.is_edited && (
                        <Text className="text-gray-400 text-[10px] text-right mt-0.5">edited</Text>
                    )}
                </View>
            </View>
            {isLast && <Text className="text-[10px] text-gray-400 ml-1 mb-1">{time}</Text>}
        </View>
    )
}

export default Message