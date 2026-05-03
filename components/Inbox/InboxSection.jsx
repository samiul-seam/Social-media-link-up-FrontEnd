import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native'
import ChatCard from './ChatCard'
import { router } from 'expo-router'
import { useState, useMemo, useCallback } from 'react'
import { Ionicons } from '@expo/vector-icons'
import authApiClient from '../../services/auth-api-client'
import useAuthContext from '../../hooks/useAuthContext'
import useInbox from '../../hooks/useInbox'

const InboxSection = () => {
    const [query, setQuery] = useState('')
    const { user } = useAuthContext()
    const { chats, loading, markAsRead, setChats } = useInbox()
    const [toast, setToast] = useState(false)

    const filteredChats = useMemo(() => {
        if (!query.trim()) return chats
        return chats.filter(chat =>
            chat.other_user.full_name.toLowerCase().includes(query.toLowerCase())
        )
    }, [query, chats])

    const handlePush = useCallback(async (item) => {
        markAsRead(item.id)
        try {
            await authApiClient.post(`/inboxes/${item.id}/messages/mark_read/`)
        } catch (err) {
            console.log('mark_read failed:', err)
        }
        router.push({
            pathname: '/Chat',
            params: { chatId: item.id, userId: user.id },
        })
    }, [user.id])

    const handleLongPress = (item) => {
        Alert.alert(
            'Delete Conversation',
            `Delete chat with ${item.other_user.full_name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await authApiClient.delete(`/inboxes/${item.id}/`)
                            setChats(prev => prev.filter(c => c.id !== item.id))
                            setToast(true)
                            setTimeout(() => setToast(false), 2000)
                        } catch {
                            console.log('delete chat failed')
                        }
                    }
                }
            ]
        )
    }

    const renderItem = ({ item }) => (
        <ChatCard
            item={item}
            currentUserId={user.id}
            onLongPress={handleLongPress}
            onPress={() => handlePush(item)}
        />
    )

    return (
        <View className="flex-1 bg-white">
            <View className="px-4 py-3 border-b border-gray-200 flex-row justify-between items-center">
                <View className="flex-row gap-2 items-center">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="black" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-800">Messages</Text>
                </View>
                {/* <TouchableOpacity> // will add latere
                    <Text className="text-2xl">✏️</Text>
                </TouchableOpacity> */}
            </View>

            <View className="px-4 py-2">
                <View className="bg-gray-100 rounded-full px-4 py-2 flex-row items-center">
                    <TextInput
                        value={query}
                        onChangeText={setQuery}
                        placeholder="Search..."
                        className="flex-1 bg-gray-100 rounded-2xl px-3 py-2 text-sm"
                    />
                    <TouchableOpacity className="bg-blue-500 ml-2 rounded-full p-3 justify-center items-center">
                        <Ionicons name="search" size={12} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator className="mt-10" size="large" color="#3b82f6" />
            ) : (
                <FlatList
                    data={filteredChats}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View className="mt-20 items-center">
                            <Text className="text-gray-400">No conversations found</Text>
                        </View>
                    }
                />
            )}

            {toast && (
                <View className="absolute top-16 left-4 right-4 z-50 bg-gray-800 rounded-xl px-4 py-3 items-center">
                    <Text className="text-white text-sm font-medium">Conversation deleted</Text>
                </View>
            )}
        </View>
    )
}

export default InboxSection