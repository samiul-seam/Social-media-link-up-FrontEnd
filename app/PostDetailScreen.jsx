import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import PostCard from '../components/Post/PostCard'

export default function PostDetailScreen() {
  const { post } = useLocalSearchParams()
  const parsePost = JSON.parse(post)

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center text-center ml-3 py-2">
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-1">
          <Ionicons name="arrow-back" size={24} color="black" />
          <Text className="text-xl">Back</Text>
        </TouchableOpacity>
      </View>

      <PostCard
        post={parsePost}
        onCommentPress={(post) => router.push({
          pathname: '/comments',
          params: { id: post.id, post: JSON.stringify(post) }
        })}
      />
    </SafeAreaView>
  )
}