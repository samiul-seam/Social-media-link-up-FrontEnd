import { useLocalSearchParams, useRouter } from 'expo-router'
import { TouchableOpacity, View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import CommentSection from '../components/Post/CommentSection'

const CommentsScreen = () => {
  const { post, id } = useLocalSearchParams()
  const router = useRouter()
 
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-2 border-b border-gray-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center gap-1"
        >
          <Ionicons name="arrow-back" size={22} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            router.push({ pathname: '/PostDetailScreen', params: { post } })
          }
          className="flex-row items-center gap-1"
        >
          <Text className="text-indigo-600 text-sm font-semibold">View Post</Text>
          <Ionicons name="arrow-forward" size={16} color="#6366f1" />
        </TouchableOpacity>
      </View>

      <CommentSection postId={id} onClose={() => router.back()} />
    </SafeAreaView>
  )
}

export default CommentsScreen