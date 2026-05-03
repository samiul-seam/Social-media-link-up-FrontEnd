import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native'
import NotificationCard from './NotificationCard'
import { useCallback, useRef, useState } from 'react'
import { useFocusEffect } from 'expo-router'
import authApiClient from '../../services/auth-api-client'

const NotificationSection = () => {
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(false)
    const [refreshing, setRefreshing] = useState(false)

    const fetchNotifications = async () => {
        try {
            const res = await authApiClient.get('/notification/')
            setNotifications(res.data)
        } catch {}
    }

    useFocusEffect(
        useCallback(() => {
            setLoading(true)
            fetchNotifications().finally(() => setLoading(false))
        }, [])
    )

    const onRefresh = async () => {
        setRefreshing(true)
        await fetchNotifications()
        setRefreshing(false)
    }

    if (loading) return (
        <View style={{ height: 300 }} className="justify-center items-center">
            <ActivityIndicator size="small" color="#3b82f6" />
        </View>
    )

    if (notifications.length === 0) return (
        <View style={{ height: 300 }} className="justify-center items-center">
            <Text className="text-gray-400">No notifications</Text>
        </View>
    )

    return (
        <FlatList
            data={notifications}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
                <View>
                    <NotificationCard item={item} />
                    <View className="border-b border-gray-100 mx-4" />
                </View>
            )}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#3b82f6']}
                    tintColor="#3b82f6"
                />
            }
        />
    )
}

export default NotificationSection