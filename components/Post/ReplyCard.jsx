import { Image } from "expo-image"
import { Text, TouchableOpacity, View } from "react-native"
import authApiClient from "../../services/auth-api-client"
import { useState } from "react"
import defaultImg from '../../assets/default_img.jpg'
import { Ionicons } from "@expo/vector-icons"
import useAuthContext from '../../hooks/useAuthContext'

const ReplyCard = ({ reply, postId, commentId, onEditRequest, onDeleted }) => {
    const { user } = useAuthContext()
    const [replyLiked, setReplyLiked] = useState(reply.is_liked)
    const [replyLikeId, setReplyLikeId] = useState(reply.like_id ?? null)
    const [replyLikeCount, setReplyLikeCount] = useState(reply.like_count ?? 0)
    const [replyLikeLoading, setReplyLikeLoading] = useState(false)
    const [showMenu, setShowMenu] = useState(false)

    const isOwner = user?.id === reply.user

    const handleReplyLike = async () => {
        if (replyLikeLoading) return
        setReplyLikeLoading(true)
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
            if (replyLiked) {
                setReplyLiked(true)
                setReplyLikeCount(prev => prev + 1)
            } else {
                setReplyLiked(false)
                setReplyLikeCount(prev => prev - 1)
            }
        } finally {
            setReplyLikeLoading(false)
        }
    }

    const handleDelete = async () => {
        try {
            await authApiClient.delete(
                `/posts/${postId}/comments/${commentId}/replies/${reply.id}/`
            )
            onDeleted()
        } catch {
            console.log("can't delete reply")
        }
    }

    return (
        <TouchableOpacity activeOpacity={1} onLongPress={() => isOwner && setShowMenu(true)}>
            <View className="flex-row items-start gap-2 mb-3 relative">
                <Image
                    source={reply.user_profile ? { uri: reply.user_profile } : defaultImg}
                    style={{ width: 24, height: 24, borderRadius: 12 }}
                />

                <View className="flex-1 bg-gray-50 rounded-xl px-2 py-1.5">
                    <Text className="font-semibold text-gray-800 text-[10px]">{reply.user_name}</Text>
                    <Text className="text-gray-700 text-sm">{reply.content}</Text>
                </View>

                <TouchableOpacity
                    onPress={handleReplyLike}
                    disabled={replyLikeLoading}
                    className="items-center justify-center pt-1"
                >
                    <Text>{replyLiked ?
                        <Ionicons name='heart' size={20} color="red" />
                        : <Ionicons name='heart-outline' size={20} />}
                    </Text>
                    <Text className="text-xs text-gray-500">{replyLikeCount ? replyLikeCount : ""}</Text>
                </TouchableOpacity>

                {showMenu && (
                    <>
                        <TouchableOpacity
                            className="absolute top-0 left-0 right-0 bottom-0 z-10"
                            activeOpacity={1}
                            onPress={() => setShowMenu(false)}
                        />
                        <View className="absolute right-8 -top-4 z-20 bg-white rounded-xl shadow-md p-2 w-28">
                            <TouchableOpacity
                                onPress={() => {
                                    setShowMenu(false)
                                    onEditRequest({ id: reply.id, content: reply.content, type: 'reply', commentId })
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
            </View>
        </TouchableOpacity>
    )
}

export default ReplyCard