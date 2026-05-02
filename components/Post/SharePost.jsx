import { Text, TouchableOpacity, View, Modal, Pressable, Clipboard } from 'react-native'
import { useEffect, useState } from 'react'
import authApiClient from '../../services/auth-api-client'
import { Ionicons } from '@expo/vector-icons'

const SharePost = ({ postId, isOpen, onClose }) => {
    const [link, setLink] = useState("")
    const [loading, setLoading] = useState(false)
    const [isCopied, setIsCopied] = useState(false)

    useEffect(() => {
        if (!isOpen) return  // ← only fetch when modal opens
        setLoading(true)
        authApiClient.get(`/posts/${postId}/share/`)
            .then((res) => setLink(res.data))
            .finally(() => setLoading(false))
    }, [isOpen, postId])

    const handleCopy = () => {
        Clipboard.setString(link.share_url)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
    }

    return (
        <Modal transparent visible={isOpen} animationType="slide">
            <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
                <Pressable>
                    <View className="bg-white rounded-t-2xl p-5">
                        {/* Header */}
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="font-bold text-base">Share Post</Text>
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close" size={22} color="gray" />
                            </TouchableOpacity>
                        </View>

                        {/* Link */}
                        <View className="bg-gray-100 rounded-xl px-4 py-3 flex-row items-center justify-between">
                            <Text className="text-gray-600 text-xs flex-1 mr-2" numberOfLines={1}>
                                {loading ? 'Getting link...' : link.share_url}
                            </Text>
                            <TouchableOpacity
                                onPress={handleCopy}
                                disabled={isCopied}
                                className={`${!isCopied ? "bg-indigo-600" : "bg-gray-400"} px-3 py-1.5 rounded-lg`}
                            >
                                <Text className={`text-xs font-semibold ${!isCopied ? "text-white" : "text-black"}`}>
                                    {isCopied ? "Copied" : "Copy"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    )
}

export default SharePost