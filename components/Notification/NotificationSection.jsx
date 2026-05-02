import { View, Text, FlatList, Alert, ActivityIndicator } from 'react-native'
import NotificationCard from './NotificationCard'
import { useCallback, useState } from 'react'
import { useFocusEffect } from 'expo-router'
import authApiClient from '../../services/auth-api-client'

const NotificationSection = () => {
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)

    useFocusEffect(
        useCallback(() => {
            setLoading(true)
            authApiClient.get('/notification/')
                .then(res => setNotifications(res.data))
                .catch(() => { })
                .finally(() => setLoading(false))
        }, [])
    )

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
        />
    )
}


export default NotificationSection