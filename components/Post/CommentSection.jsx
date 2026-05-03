import { Ionicons } from '@expo/vector-icons'
import { useRef, useState } from 'react'
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import CommentCard from './CommentCard'
import useFetchComments from '../../hooks/useFetchComments'
import authApiClient from '../../services/auth-api-client'
import useKeyboardHeight from '../../hooks/useKayboardHeight'

const CommentSection = ({ postId, onClose }) => {
  const [changeComments, setChangeComments] = useState(false)
  const { comments, isLoading } = useFetchComments(postId, changeComments)
  const [comment, setComment] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [editingComment, setEditingComment] = useState(null) // { id, type: 'comment' | 'reply', commentId? }
  const [loadSendButton, setLoadSendButton] = useState(false)
  const listRef = useRef(null)
  const inputRef = useRef(null)
  const animatedHeight = useKeyboardHeight()

  const handleEditRequest = (data) => {
    // data = { id, content, type: 'comment' } or { id, content, type: 'reply', commentId }
    setEditingComment(data)
    setReplyTo(null)
    setComment(data.content)
    inputRef.current?.focus()
  }

  const handleSend = async () => {
    if (!comment.trim()) return
    setLoadSendButton(true)

    try {
      if (editingComment) {
        // EDIT mode
        if (editingComment.type === 'comment') {
          await authApiClient.patch(`/posts/${postId}/comments/${editingComment.id}/`, {
            content: comment.trim()
          })
        } else {
          await authApiClient.patch(`/posts/${postId}/comments/${editingComment.commentId}/replies/${editingComment.id}/`, {
            content: comment.trim()
          })
        }
      } else if (replyTo) {
        await authApiClient.post(`/posts/${postId}/comments/${replyTo.id}/replies/`, {
          content: comment
        })
      } else {
        await authApiClient.post(`/posts/${postId}/comments/`, {
          content: comment
        })
      }
      setChangeComments(prev => !prev)
    } catch {
      console.log("something went wrong")
    } finally {
      setLoadSendButton(false)
      setComment('')
      setReplyTo(null)
      setEditingComment(null)
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>

      {/* List */}
      {isLoading ? (
        <View style={{ flex: 1 }} className="justify-center items-center">
          <ActivityIndicator size="small" color="#3b82f6" />
        </View>
      ) : comments.length === 0 ? (
        <View style={{ flex: 1 }} className="justify-center items-center">
          <Text className="text-gray-400">No comments yet</Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={comments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <CommentCard
              item={item}
              onReply={setReplyTo}
              postId={postId}
              onEditRequest={handleEditRequest}
              onDeleted={() => setChangeComments(prev => !prev)}
            />
          )}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 12, paddingBottom: 16 }}
          style={{ flex: 1 }}
        />
      )}

      {/* Input */}
      <Animated.View style={{ marginBottom: animatedHeight }}>
        <View className="bg-white border-t border-gray-100">

          {/* Reply banner */}
          {replyTo && (
            <View className="px-4 py-2 bg-gray-50 flex-row justify-between items-center">
              <Text className="text-gray-500 text-xs">
                Replying to <Text className="font-bold text-gray-700">{replyTo.user_name}</Text>
              </Text>
              <TouchableOpacity onPress={() => setReplyTo(null)}>
                <Ionicons name="close-circle" size={18} color="gray" />
              </TouchableOpacity>
            </View>
          )}

          {/* Edit banner */}
          {editingComment && (
            <View className="px-4 py-2 bg-blue-50 flex-row justify-between items-center">
              <Text className="text-blue-500 text-xs font-medium">Editing comment</Text>
              <TouchableOpacity onPress={() => { setEditingComment(null); setComment('') }}>
                <Ionicons name="close-circle" size={18} color="#3b82f6" />
              </TouchableOpacity>
            </View>
          )}

          <View className="flex-row items-end px-3 py-2 gap-2">
            <TextInput
              ref={inputRef}
              value={comment}
              onChangeText={setComment}
              placeholder="Write a comment..."
              multiline
              style={{
                flex: 1,
                backgroundColor: '#f3f4f6',
                borderRadius: 20,
                paddingHorizontal: 15,
                paddingTop: 10,
                paddingBottom: 10,
                maxHeight: 100,
              }}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={loadSendButton || !comment.trim()}
              className={`w-10 h-10 rounded-full items-center justify-center mb-0.5 ${comment.trim() ? 'bg-blue-500' : 'bg-gray-200'}`}
            >
              {loadSendButton ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="send" size={20} color={comment.trim() ? 'white' : '#9ca3af'} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  )
}

export default CommentSection;