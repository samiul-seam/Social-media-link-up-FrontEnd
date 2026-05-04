import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import authApiClient from '../services/auth-api-client'
import FollowsCard from '../components/Profile/FollowsCard'

export default function FollowListScreen() {
    const { type, userId } = useLocalSearchParams()
    const [activeTab, setActiveTab] = useState(type ?? 'followers')
    const [followers, setFollowers] = useState([])
    const [following, setFollowing] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const query = userId ? `?user_id=${userId}` : ''
        Promise.all([
            authApiClient.get(`/follows/followers/${query}`),
            authApiClient.get(`/follows/following/${query}`),
        ])
            .then(([followersRes, followingRes]) => {
                setFollowers(followersRes.data)
                setFollowing(followingRes.data)
            })
            .catch(err => console.log(err))
            .finally(() => setLoading(false))
    }, [userId])

    const list = activeTab === 'followers' ? followers : following

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="ml-3 font-semibold text-gray-800 text-base">Connections</Text>
            </View>

            {/* Tabs */}
            <View className="flex-row border-b border-gray-200">
                {['followers', 'following'].map(tab => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => setActiveTab(tab)}
                        className="flex-1 items-center py-3"
                    >
                        <Text className={`text-sm font-semibold capitalize ${activeTab === tab ? 'text-blue-500' : 'text-gray-400'}`}>
                            {tab}
                        </Text>
                        {activeTab === tab && (
                            <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#3b82f6" />
                </View>
            ) : (
                <FlatList
                    data={list}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => <FollowsCard item={item} />}
                    ListEmptyComponent={
                        <View className="items-center mt-20">
                            <Text className="text-gray-400">No {activeTab} yet</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    )
}