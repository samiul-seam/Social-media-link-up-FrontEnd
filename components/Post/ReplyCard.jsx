import { Image } from "expo-image"
import { Text, TouchableOpacity, View } from "react-native"
import authApiClient from "../../services/auth-api-client"
import { useState } from "react"
import defaultImg from '../../assets/default_img.jpg'


const ReplyCard = ({ reply, postId, commentId }) => {
    const [replyLiked, setReplyLiked] = useState(reply.is_liked)
    const [replyLikeId, setReplyLikeId] = useState(reply.like_id ?? null)
    const [replyLikeCount, setReplyLikeCount] = useState(reply.like_count ?? 0)
    const [replyLikeLoading, setReplyLikeLoading] = useState(false)

    const handleReplyLike = async () => {
        if (replyLikeLoading) return
        setReplyLikeLoading(true)

        // optimistic update
        if (replyLiked) {
            setReplyLiked(false)
            setReplyLikeCount(prev => prev - 1)
        } else {
            setReplyLiked(true)
            setReplyLikeCount(prev => prev + 1)
        }

        try {
            if (replyLiked) {
                await authApiClient.delete(
                    `/posts/${postId}/comments/${commentId}/replies/${reply.id}/likes/${replyLikeId}/`
                )
                setReplyLikeId(null)
            } else {
                const res = await authApiClient.post(
                    `/posts/${postId}/comments/${commentId}/replies/${reply.id}/likes/`
                )
                setReplyLikeId(res.data.id)
            }
        } catch {
            // revert on failure
            if (replyLiked) {
                setReplyLiked(true)
                setReplyLikeCount(prev => prev + 1)
            } else {
                setReplyLiked(false)
                setReplyLikeCount(prev => prev - 1)
            }
            console.log("can't like reply")
        } finally {
            setReplyLikeLoading(false)
        }
    }

    return (
        <View className="flex-row items-start gap-2 mb-3">
            <Image
                source={reply.user_profile ? { uri: reply.user_profile } : defaultImg}
                style={{ width: 24, height: 24, borderRadius: 12 }}
            />
            <View className="flex-1 bg-gray-50 rounded-xl px-2 py-1.5">
                <Text className="font-semibold text-gray-800 text-[10px]">
                    {reply.user_name}
                </Text>
                <Text className="text-gray-700 text-sm">
                    {reply.content}
                </Text>
            </View>
            <TouchableOpacity
                onPress={handleReplyLike}
                disabled={replyLikeLoading}
                className="items-center justify-center pt-1"
            >
                <Text>{replyLiked ? '❤️' : '🤍'}</Text>
                <Text className="text-xs text-gray-500">{replyLikeCount}</Text>
            </TouchableOpacity>
        </View>
    )
}

export default ReplyCard;