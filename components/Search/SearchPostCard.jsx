import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import defaultImg from "../../assets/default_img.jpg";

const formatTime = (isoString) => {
  if (!isoString) return ''
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000)
  if (diff < 60) return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

const PostCard = ({ item, query }) => {
  const initials = item.user_name
    ?.split(' ')
    .map(n => n?.[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const highlightText = (text) => {
    if (!query || !text) {
      return <Text className="text-gray-700 text-sm leading-5">{text}</Text>
    }

    const regex = new RegExp(`(${query})`, "gi")
    const parts = text.split(regex)

    return (
      <Text className="text-gray-700 text-sm leading-5">
        {parts.map((part, i) => {
          if (!part) return null

          return part.toLowerCase() === query.toLowerCase() ? (
            <Text key={i} className="text-indigo-500 font-semibold">
              {part}
            </Text>
          ) : (
            <Text key={i}>{part}</Text>
          )
        })}
      </Text>
    )
  }

  return (
    <TouchableOpacity className="px-4 py-3 border-b border-gray-100">
      {/* Header */}
      <View className="flex-row items-center gap-2 mb-2">
        <View className="w-8 h-8 rounded-full bg-indigo-900/60 items-center justify-center">
          <Text className="text-xs font-semibold text-indigo-300">
            {initials}
          </Text>
        </View>

        <Text className="text-gray-900 font-semibold text-sm">
          {item.user_name}
        </Text>

        <Text className="text-gray-300 text-xs ml-auto">
          {formatTime(item.created_at)}
        </Text>
      </View>

      {/* Caption */}
      {highlightText(item.caption)}

      {/* Images */}
      {item.images?.length > 0 && (
        <Image
          source={{ uri: item.images[0].image }}
          style={{ width: '100%', height: 180, borderRadius: 8, marginTop: 8 }}
          contentFit="cover"
        />
      )}

      {/* Footer */}
      <View className="flex-row gap-5 mt-3">
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="heart-outline" size={14} color="#d1d5db" />
          <Text className="text-gray-400 text-xs">
            {item.likes?.length ?? 0}
          </Text>
        </View>

        <View className="flex-row items-center gap-1.5">
          <Ionicons name="chatbubble-outline" size={14} color="#d1d5db" />
          <Text className="text-gray-400 text-xs">
            {item.comments?.length ?? 0}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default PostCard