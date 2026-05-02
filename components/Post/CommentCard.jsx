import { Text, TouchableOpacity, View } from 'react-native'
import { Image } from 'expo-image'
import defaultImg from '../../assets/default_img.jpg'
import { useState } from 'react'
import authApiClient from '../../services/auth-api-client'
import ReplyCard from './ReplyCard'


const CommentCard = ({ item, onReply, postId }) => {
  const [commentLiked, setCommentLiked] = useState(!!item.is_liked)
  const [likeId, setLikeId] = useState(item?.like_id ?? null)
  const [commentLikeCount, setCommentLikeCount] = useState(item.like_count ?? 0)
  const [likeLoading, setLikeLoading] = useState(false)

  const handleCommentLike = async () => {
    if (likeLoading) return
    setLikeLoading(true)

    // optimistic update
    if (commentLiked) {
      setCommentLiked(false)
      setCommentLikeCount(prev => prev - 1)
    } else {
      setCommentLiked(true)
      setCommentLikeCount(prev => prev + 1)
    }

    try {
      if (commentLiked) {
        await authApiClient.delete(`/posts/${postId}/comments/${item.id}/likes/${likeId}/`)
        setLikeId(null)
      } else {
        const res = await authApiClient.post(`/posts/${postId}/comments/${item.id}/likes/`)
        setLikeId(res.data.id)
      }
    } catch {
      // revert on failure
      if (commentLiked) {
        setCommentLiked(true)
        setCommentLikeCount(prev => prev + 1)
      } else {
        setCommentLiked(false)
        setCommentLikeCount(prev => prev - 1)
      }
      console.log("can't like comment")
    } finally {
      setLikeLoading(false)
    }
  }

  return (
    <View className="flex-row items-start gap-3 mb-6">
      <Image
        source={item.user_profile ? { uri: item.user_profile } : defaultImg}
        style={{ width: 32, height: 32, borderRadius: 16 }}
      />

      <View className="flex-1">
        {/* Comment Bubble */}
        <View className="flex-row items-start gap-2">
          <View className="flex-1 bg-gray-100 rounded-2xl px-3 py-2">
            <Text className="font-semibold text-gray-800 text-xs">
              {item.user_name}
            </Text>
            <Text className="text-gray-700 text-sm mt-1">
              {item.content}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleCommentLike}
            disabled={likeLoading}
            className="items-center justify-center pt-1"
          >
            <Text>{commentLiked ? '❤️' : '🤍'}</Text>
            <Text className="text-xs text-gray-500">{commentLikeCount}</Text>
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <View className="flex-row gap-4 mx-3 mt-1">
          <TouchableOpacity onPress={() => onReply(item)}>
            <Text className="text-gray-500 font-medium text-xs">Reply</Text>
          </TouchableOpacity>
        </View>

        {/* Replies */}
        {item.replies && item.replies.length > 0 && (
          <View className="mt-3 ml-2 border-l border-gray-200 pl-4">
            {item.replies.map((reply) => (
              <ReplyCard
                key={reply.id}
                reply={reply}
                postId={postId}
                commentId={item.id}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  )
}

export default CommentCard
