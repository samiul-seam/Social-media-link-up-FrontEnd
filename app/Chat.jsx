import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'
import { View, Text, TextInput, TouchableOpacity, FlatList, Animated, Alert, ActivityIndicator, Modal, Pressable } from 'react-native'
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
    const wsRef = useRef(null)
    const inputRef = useRef(null)

    // edit/delete state
    const [editingMessage, setEditingMessage] = useState(null)
    const [menuVisible, setMenuVisible] = useState(false)
    const [selectedMessage, setSelectedMessage] = useState(null)

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
        : null

    const handleEditRequest = (item) => {
        setSelectedMessage(item)
        setMenuVisible(true)
    }

    const handleEditConfirm = () => {
        setMenuVisible(false)
        setEditingMessage(selectedMessage)
        setMessage(selectedMessage.message)
        inputRef.current?.focus()
    }

    const handleDeleteConfirm = async () => {
        setMenuVisible(false)
        try {
            await authApiClient.delete(`/inboxes/${numericChatId}/messages/${selectedMessage.id}/`)
            setChatMessages(prev => prev.filter(m => m.id !== selectedMessage.id))
        } catch {
            Alert.alert('Error', 'Failed to delete message.')
        } finally {
            setSelectedMessage(null)
        }
    }

    const handleSend = async () => {
        const trimmed = message.trim()
        if (!trimmed || sending) return

        // EDIT mode
        if (editingMessage) {
            try {
                await authApiClient.patch(`/inboxes/${numericChatId}/messages/${editingMessage.id}/`, {
                    message: trimmed
                })
                setChatMessages(prev =>
                    prev.map(m => m.id === editingMessage.id ? { ...m, message: trimmed } : m)
                )
            } catch {
                Alert.alert('Error', 'Failed to edit message.')
            } finally {
                setEditingMessage(null)
                setMessage('')
            }
            return
        }

        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ message: trimmed }))
            setMessage('')
            return
        }

        // fallback REST
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

    useEffect(() => {
        if (!authTokens?.access || !numericChatId) return

        const ws = new WebSocket(`${WS_BASE}/ws/chat/${numericChatId}/?token=${authTokens.access}`)
        wsRef.current = ws

        ws.onmessage = (e) => {
            const data = JSON.parse(e.data)
            setChatMessages((prev) => {
                if (prev.find((m) => m.id === data.message_id)) return prev

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
                onEditRequest={handleEditRequest}
            />
        )
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>

            {/* Header */}
            <View className="flex-row items-center px-3 py-3 border-b border-gray-200 bg-white">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Image
                    source={otherUser?.profile_picture ? { uri: otherUser?.profile_picture } : defaultImg}
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

                    {/* Edit banner */}
                    {editingMessage && (
                        <View className="absolute -top-9 left-0 right-0 px-4 py-2 bg-blue-50 flex-row justify-between items-center">
                            <Text className="text-blue-500 text-xs font-medium">Editing message</Text>
                            <TouchableOpacity onPress={() => { setEditingMessage(null); setMessage('') }}>
                                <Ionicons name="close-circle" size={18} color="#3b82f6" />
                            </TouchableOpacity>
                        </View>
                    )}

                    <TextInput
                        ref={inputRef}
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
                        className={`w-10 h-10 rounded-full items-center justify-center mb-0.5 ${sending || !message.trim() ? 'bg-gray-200' : 'bg-blue-500'}`}
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

            {/* Long-press Menu Modal */}
            <Modal
                transparent
                visible={menuVisible}
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                <Pressable
                    style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}
                    onPress={() => setMenuVisible(false)}
                >
                    <Pressable className="bg-white rounded-t-2xl px-4 pt-4 pb-8">
                        <View className="w-10 h-1 bg-gray-300 rounded-full self-center mb-4" />
                        <TouchableOpacity
                            onPress={handleEditConfirm}
                            className="flex-row items-center gap-3 py-3 border-b border-gray-100"
                        >
                            <Ionicons name="pencil-outline" size={20} color="#374151" />
                            <Text className="text-gray-800 text-base">Edit message</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleDeleteConfirm}
                            className="flex-row items-center gap-3 py-3"
                        >
                            <Ionicons name="trash-outline" size={20} color="#ef4444" />
                            <Text className="text-red-500 text-base">Delete message</Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>

        </SafeAreaView>
    )
}