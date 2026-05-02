import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { View, Text, TextInput, TouchableOpacity, FlatList, Animated, Alert, ActivityIndicator } from 'react-native'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRef, useState, useCallback, useEffect } from 'react'
import Message from '../components/Inbox/Message'
import useKeyboardHeight from '../hooks/useKayboardHeight'
import authApiClient from '../services/auth-api-client'
import defaultImg from '../assets/default_img.jpg'
import useAuthContext from '../hooks/useAuthContext'
const WS_BASE = 'ws://192.168.10.40:8000'


export default function ChatScreen() {
    const { chatId, userId } = useLocalSearchParams()
    const numericChatId = Number(chatId)
    const currentUserId = Number(userId)
    const { authTokens } = useAuthContext()


    const [message, setMessage] = useState('')
    const [chatMessages, setChatMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const flatListRef = useRef(null)
    const animatedHeight = useKeyboardHeight()
    const wsRef = useRef(null) // for web socket 

    const fetchMessages = async () => {
        try {
            const res = await authApiClient.get(`/inboxes/${numericChatId}/messages/`)
            setChatMessages(res.data)
        } catch (err) {
            Alert.alert('Error', err?.response?.data?.detail ?? 'Failed to load messages.')
        } finally {
            setLoading(false)
        }
    }

    useFocusEffect(
        useCallback(() => {
            fetchMessages()
        }, [])
    )

    const otherUser = chatMessages.length > 0
        ? (chatMessages[0].sender_profile.id === currentUserId
            ? chatMessages[0].receiver_profile
            : chatMessages[0].sender_profile)
        : null;

    const handleSend = async () => {
        const trimmed = message.trim()
        if (!trimmed || sending) return

        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ message: trimmed }))
            setMessage('')
            return  // ← exit here, WS handles it
        }

        // fallback to REST if WS is down
        setSending(true)
        try {
            await authApiClient.post(`/inboxes/${numericChatId}/messages/`, { message: trimmed })
            setMessage('')
            fetchMessages()
        } catch (err) {
            Alert.alert('Error', err?.response?.data?.detail ?? 'Failed to send message.')
        } finally {
            setSending(false)
        }
    }

    // ── WebSocket — only new addition ──────────────────────────────────
    useEffect(() => {
        if (!authTokens?.access || !numericChatId) return

        const ws = new WebSocket(`${WS_BASE}/ws/chat/${numericChatId}/?token=${authTokens.access}`)
        wsRef.current = ws

        ws.onmessage = (e) => {
            const data = JSON.parse(e.data)
            setChatMessages((prev) => {
                if (prev.find((m) => m.id === data.message_id)) return prev

                // reuse full profile objects from existing messages
                const existingMsg = prev[0]
                const mySelf = existingMsg
                    ? (existingMsg.sender_profile.id === currentUserId
                        ? existingMsg.sender_profile
                        : existingMsg.receiver_profile)
                    : { id: currentUserId }

                const other = existingMsg
                    ? (existingMsg.sender_profile.id === currentUserId
                        ? existingMsg.receiver_profile
                        : existingMsg.sender_profile)
                    : { id: data.sender_id }

                const newMsg = {
                    id: data.message_id,
                    message: data.message,
                    sender_profile: data.sender_id === currentUserId ? mySelf : other,
                    receiver_profile: data.sender_id === currentUserId ? other : mySelf,
                    created_at: data.created_at,
                    is_read: data.is_read,
                }
                return [newMsg, ...prev]
            })
        }

        return () => ws.close()
    }, [authTokens?.access, numericChatId])

    const renderItem = ({ item, index }) => {
        const prevMessage = chatMessages[index + 1]
        const nextMessage = chatMessages[index - 1]

        const isFirst = prevMessage?.sender_profile?.id !== item.sender_profile?.id
        const isLast = nextMessage?.sender_profile?.id !== item.sender_profile?.id

        return (
            <Message
                key={item.id}
                item={item}
                currentUserId={currentUserId}
                isFirst={isFirst}
                isLast={isLast}
            />
        )
    }


    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>

            {/* Header — fix: was parsedChat.avatar / parsedChat.name (undefined) */}
            <View className="flex-row items-center px-3 py-3 border-b border-gray-200 bg-white">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Image
                    source={otherUser?.profile_picture
                        ? { uri: otherUser?.profile_picture }
                        : defaultImg}
                    style={{ width: 40, height: 40, borderRadius: 20, marginLeft: 10 }}
                />
                <Text numberOfLines={1} className="ml-2 font-semibold text-gray-800 text-base flex-1">
                    {otherUser?.full_name}
                </Text>
            </View>

            {/* Messages */}
            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <Text className="text-gray-400">Loading messages...</Text>
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={chatMessages}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    style={{ flex: 1 }}
                    inverted
                    contentContainerStyle={{ padding: 10 }}
                    ListEmptyComponent={
                        <View className="flex-1 items-center justify-center mt-20 gap-2">
                            <Text className="text-gray-400">No messages yet. Say hi! 👋</Text>
                        </View>
                    }
                />
            )}

            {/* Input */}
            <Animated.View style={{ marginBottom: animatedHeight }}>
                <View className="bg-white border-t border-gray-200 flex-row items-end px-3 py-2 gap-2">
                    <TextInput
                        value={message}
                        onChangeText={setMessage}
                        placeholder="Type a message..."
                        multiline
                        textAlignVertical="top"
                        className="flex-1 bg-gray-100 rounded-3xl px-4 py-2 text-base max-h-32 border border-gray-200"
                    />
                    <TouchableOpacity
                        onPress={handleSend}
                        disabled={sending || !message.trim()}
                        className={`w-10 h-10 rounded-full items-center justify-center mb-0.5 ${sending || !message.trim() ? 'bg-gray-200' : 'bg-blue-500'
                            }`}
                    >
                        {sending ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Ionicons
                                name="send"
                                size={18}
                                color={sending || !message.trim() ? '#9CA3AF' : 'white'}
                            />
                        )}
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </SafeAreaView>
    )
}