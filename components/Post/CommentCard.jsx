import { Text, TouchableOpacity, View } from 'react-native'
import { Image } from 'expo-image'
import defaultImg from '../../assets/default_img.jpg'
import { useState } from 'react'
import authApiClient from '../../services/auth-api-client'
import ReplyCard from './ReplyCard'
import { Ionicons } from '@expo/vector-icons'
import useAuthContext from '../../hooks/useAuthContext'

const CommentCard = ({ item, onReply, postId, onEditRequest, onDeleted }) => {
  const { user } = useAuthContext()
  const [commentLiked, setCommentLiked] = useState(!!item.is_liked)
  const [likeId, setLikeId] = useState(item?.like_id ?? null)
  const [commentLikeCount, setCommentLikeCount] = useState(item.like_count ?? 0)
  const [likeLoading, setLikeLoading] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const isOwner = user?.id === item.user

  const handleCommentLike = async () => {
    if (likeLoading) return
    setLikeLoading(true)
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
      if (commentLiked) {
        setCommentLiked(true)
        setCommentLikeCount(prev => prev + 1)
      } else {
        setCommentLiked(false)
        setCommentLikeCount(prev => prev - 1)
      }
    } finally {
      setLikeLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await authApiClient.delete(`/posts/${postId}/comments/${item.id}/`)
      onDeleted()
    } catch {
      console.log("Delete failed")
    }
  }

  return (
    <TouchableOpacity activeOpacity={1} onLongPress={() => isOwner && setShowMenu(true)}>
      <View className="flex-row items-start gap-3 mb-6 relative">
        <Image
          source={item.user_profile ? { uri: item.user_profile } : defaultImg}
          style={{ width: 32, height: 32, borderRadius: 16 }}
        />

        <View className="flex-1">
          <View className="flex-row items-start gap-2">
            <View className="flex-1 bg-gray-100 rounded-2xl px-3 py-2">
              <Text className="font-semibold text-gray-800 text-xs">{item.user_name}</Text>
              <Text className="text-gray-700 text-sm mt-1">{item.content}</Text>
            </View>

            <TouchableOpacity
              onPress={handleCommentLike}
              disabled={likeLoading}
              className="items-center justify-center pt-1"
            >
              <Text>{commentLiked ?
                <Ionicons name='heart' size={20} color="red" />
                : <Ionicons name='heart-outline' size={20} />}
              </Text>
              <Text className="text-xs text-gray-500">{commentLikeCount ? commentLikeCount : ""}</Text>
            </TouchableOpacity>
          </View>

          {showMenu && (
            <>
              <TouchableOpacity
                className="absolute top-0 left-0 -right-4 bottom-0 z-10"
                activeOpacity={1}
                onPress={() => setShowMenu(false)}
              />
              <View className="absolute right-7 -top-1 z-20 bg-white rounded-xl shadow-md p-2 w-28">
                <TouchableOpacity
                  onPress={() => {
                    setShowMenu(false)
                    onEditRequest({ id: item.id, content: item.content, type: 'comment' })
                  }}
                  className="py-2 px-3"
                >
                  <Text className="text-gray-800">Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => { setShowMenu(false); handleDelete() }}
                  className="py-2 px-3"
                >
                  <Text className="text-red-500">Delete</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          <View className="flex-row gap-4 mx-3 mt-1">
            <TouchableOpacity onPress={() => onReply(item)}>
              <Text className="text-gray-500 font-medium text-xs">Reply</Text>
            </TouchableOpacity>
          </View>

          {item.replies && item.replies.length > 0 && (
            <View className="mt-3 ml-2 border-l border-gray-200 pl-4">
              {item.replies.map((reply) => (
                <ReplyCard
                  key={reply.id}
                  reply={reply}
                  postId={postId}
                  commentId={item.id}
                  onEditRequest={onEditRequest}
                  onDeleted={onDeleted}
                />
              ))}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default CommentCard