import { Image } from 'expo-image'
import { ActivityIndicator, Alert, Dimensions, FlatList, Text, TouchableOpacity, View } from 'react-native'
import defaultImg from '../../assets/default_img.jpg'
import authApiClient from '../../services/auth-api-client'
import { useState } from 'react'
import useAuthContext from '../../hooks/useAuthContext'
import SharePost from './SharePost'
import { Ionicons } from '@expo/vector-icons'

const { width } = Dimensions.get('window')

const MOODS = [
  { id: "happy", emoji: "😊", label: "Happy" },
  { id: "excited", emoji: "🎉", label: "Excited" },
  { id: "thoughtful", emoji: "🤔", label: "Thoughtful" },
  { id: "grateful", emoji: "🙏", label: "Grateful" },
  { id: "motivated", emoji: "💪", label: "Motivated" },
  { id: "relaxed", emoji: "😌", label: "Relaxed" },
  { id: "sad", emoji: "😢", label: "Sad" },
  { id: "frustrated", emoji: "😤", label: "Frustrated" },
  { id: "creative", emoji: "🎨", label: "Creative" },
  { id: "tired", emoji: "😴", label: "Tired" },
  { id: "in_love", emoji: "🥰", label: "In Love" },
  { id: "anxious", emoji: "😰", label: "Anxious" },
]

const PostCard = ({ post, onCommentPress }) => {
  const { user } = useAuthContext();
  const myLike = post?.likes?.find((like) => like.user === user?.id)
  const [liked, setLiked] = useState(!!myLike)
  const [likeId, setLikeId] = useState(myLike?.id ?? null)
  const [likeCount, setLikeCount] = useState(post?.likes?.length ?? 0)
  const [shareOpen, setShareOpen] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)

  if (!post) return null

  const formattedTime = new Date(post.created_at).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })


  const handleLike = async () => {
    if (likeLoading) return
    setLikeLoading(true)

    // optimistic update
    if (liked) {
      setLiked(false)
      setLikeCount(prev => prev - 1)
    } else {
      setLiked(true)
      setLikeCount(prev => prev + 1)
    }

    try {
      if (liked) {
        await authApiClient.delete(`/posts/${post.id}/likes/${likeId}/`)
        setLikeId(null)
      } else {
        const res = await authApiClient.post(`/posts/${post.id}/likes/`)
        setLikeId(res.data.id)
      }
    } catch {
      if (liked) {
        setLiked(true)
        setLikeCount(prev => prev + 1)
      } else {
        setLiked(false)
        setLikeCount(prev => prev - 1)
      }
      Alert.alert('Error', 'Something went wrong. Please try again.')
    } finally {
      setLikeLoading(false)
    }
  }

  const hasImages = post.images && post.images.length > 0
  const mood = MOODS.find((m) => m.id === post.mood_status)

  return (
    <View className="bg-white border-b border-gray-200 mb-3">

      {/* User Info */}
      <View className="flex-row items-center px-3 py-2">
        <Image
          source={post.profile_picture ? { uri: post.profile_picture } : defaultImg}
          style={{ width: 40, height: 40, borderRadius: 20 }}
        />
        <View className="ml-3">
          <View className="flex-row items-center gap-2">
            <Text className="font-bold text-gray-800">{post.user_name}</Text>
            {mood && (
              <Text className="text-xs text-gray-400 italic">
                · {mood.emoji} {mood.label}
              </Text>
            )}
          </View>
          <Text className="text-xs text-gray-400">{formattedTime}</Text>
        </View>
      </View>

      {/* Image Carousel */}
      {hasImages && (
        <View>
          <FlatList
            data={post?.images ?? []}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item.image }}
                style={{ width, height: 300 }}
                contentFit="cover"
              />
            )}
          />
          {post.images.length > 1 && (
            <View className="flex-row justify-center gap-1 py-2">
              {post.images.map((img) => (
                <View
                  key={img.id}
                  style={{ width: 6, height: 6, borderRadius: 3 }}
                  className="bg-gray-400"
                />
              ))}
            </View>
          )}
        </View>
      )}

      {/* Caption */}
      {post.caption ? (
        <View className="px-3 py-2">
          <Text className="text-gray-700">
            {post.caption}
          </Text>
        </View>
      ) : null}

      {/* Like / Comment counts */}
      {(likeCount > 0 || post.comments?.length > 0) && (
        <View className="flex-row gap-3 px-3 pb-1 mx-2">
          {likeCount > 0 && (
            <Text className="text-xs text-gray-400">{likeCount} likes</Text>
          )}
          {post.comments?.length > 0 && (
            <Text className="text-xs text-gray-400">{post.comments.length} comments</Text>
          )}
        </View>
      )}

      {/* Action Buttons */}
      <View className="flex-row justify-around px-4 py-3 border-t border-gray-100">
        <TouchableOpacity
          onPress={handleLike}
          disabled={likeLoading}
          className="flex-row items-center gap-1"
        >
          {likeLoading ? (
            <ActivityIndicator size="small" color="red" />
          ) : (
            <Text>{liked ?
              <Ionicons name='heart' size={20} color="red" />
              : <Ionicons name='heart-outline' size={20} />}
            </Text>
          )}
          <Text className={`${liked ? 'text-red-500' : 'text-gray-600'}`}>Like</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onCommentPress(post)}
          className="flex-row items-center gap-1"
        >
          <Text>💬</Text>
          <Text className="text-gray-600">Comment</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShareOpen(true)}
          className="flex-row items-center gap-1">
          <Ionicons name='arrow-redo-outline' size={20} />
          <Text className="text-gray-600">Share</Text>
        </TouchableOpacity>
      </View>

      <SharePost
        postId={post.id}
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
      />

    </View>
  )
}

export default PostCard