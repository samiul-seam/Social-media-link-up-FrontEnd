import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import authApiClient from "../../services/auth-api-client";
import PersonCard from "./PersonalCard";
import PostCard from "./SearchPostCard";

const TRENDING = ["#DesignSystems", "#AITools", "#Frontend", "#OpenAI", "#StartupLife", "#DarkMode", "#WebDev"];

const SearchPage = () => {
    const [query, setQuery] = useState("");
    const [activeTab, setActiveTab] = useState("people");
    const [people, setPeople] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [trendingPost, setTrendingPost] = useState([])

    // debounce search — wait 800ms after user stops typing
    useEffect(() => {
        if (!query.trim()) {
            setPeople([])
            setPosts([])
            setTrendingPost([])
            return
        }

        const timer = setTimeout(async () => {
            setLoading(true)
            try {
                const [peopleRes, postsRes, trendingPost] = await Promise.all([
                    authApiClient.get(`/users/?search=${query}`),
                    authApiClient.get(`/posts/?search=${query}`),
                    authApiClient.get('/trending/')
                ])
                setPeople(peopleRes.data)
                setTrendingPost(trendingPost.data)
                const uniquePosts = postsRes.data.filter(
                    (post, index, self) => index === self.findIndex(p => p.id === post.id)
                )
                setPosts(uniquePosts)
            } catch (err) {
                console.log('Search error:', err)
            } finally {
                setLoading(false)
            }
        }, 1000)

        return () => clearTimeout(timer)
    }, [query])

    const isSearching = query.trim().length > 0

    return (
        <SafeAreaView className="flex-1 bg-white w-full" edges={['top', 'left', 'right']}>
            <View className="px-4 pb-3">
                <Text className="text-gray-900 text-2xl font-bold mb-4">Search</Text>
                <View className="flex-row items-center bg-gray-100 border border-gray-200 rounded-xl px-3">
                    <Ionicons name="search" size={16} color="#9ca3af" />
                    <TextInput
                        className="flex-1 py-3 text-gray-800 text-sm ml-2"
                        placeholder="Search people, posts..."
                        placeholderTextColor="#9ca3af"
                        value={query}
                        onChangeText={setQuery}
                        autoCorrect={false}
                    />
                    {query.length > 0 && (
                        <TouchableOpacity
                            onPress={() => {
                                setQuery("")
                                setPeople([])
                                setPosts([])
                            }}
                            className="p-1"
                        >
                            <Ionicons name="close-circle" size={16} color="#9ca3af" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {isSearching ? (
                <View className="flex-1 w-full">
                    <View className="flex-row border-b border-gray-200 px-4">
                        {["people", "posts"].map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                onPress={() => setActiveTab(tab)}
                                className={`mr-6 pb-3 border-b-2 ${activeTab === tab ? "border-indigo-500" : "border-transparent"}`}
                            >
                                <Text className={`text-sm font-medium capitalize ${activeTab === tab ? "text-indigo-500" : "text-gray-400"}`}>
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {loading ? (
                        <View className="flex-1 items-center justify-center">
                            <ActivityIndicator size="large" color="#6366f1" />
                        </View>
                    ) : activeTab === "people" ? (
                        <FlatList
                            data={people}
                            keyExtractor={(item) => `search-people-${item.id}`}
                            className="flex-1 w-full"
                            contentContainerStyle={{ flexGrow: 1 }}
                            renderItem={({ item }) => <PersonCard item={item} />}
                            ListEmptyComponent={
                                <View className="items-center py-16">
                                    <Ionicons name="person-outline" size={32} color="#d1d5db" />
                                    <Text className="text-gray-400 text-sm mt-3">
                                        No people found for "{query}"
                                    </Text>
                                </View>
                            }
                        />
                    ) : (
                        <FlatList
                            data={posts}
                            keyExtractor={(item) => `search-post-${item.id}`}
                            className="flex-1 w-full"
                            contentContainerStyle={{ flexGrow: 1 }}
                            renderItem={({ item }) => <PostCard item={item} query={query} />}
                            ListEmptyComponent={
                                <View className="items-center py-16">
                                    <Ionicons name="document-text-outline" size={32} color="#d1d5db" />
                                    <Text className="text-gray-400 text-sm mt-3">
                                        No posts found for "{query}"
                                    </Text>
                                </View>
                            }
                        />
                    )}
                </View>
            ) : (
                <ScrollView className="flex-1 px-4 pt-2">
                    <Text className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">
                        Trending topics
                    </Text>
                    <View className="flex-row flex-wrap gap-2 mb-6">
                        {TRENDING.map((tag) => (
                            <TouchableOpacity
                                key={tag}
                                onPress={() => setQuery(tag)}
                                className="bg-gray-100 border border-gray-200 rounded-full px-4 py-2"
                            >
                                <Text className="text-gray-600 text-xs">{tag}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text className="text-gray-400 text-xs font-semibold uppercase tracking-widest mb-3">
                        Suggested people
                    </Text>
                    <SuggestedPeople />
                </ScrollView>
            )}
        </SafeAreaView>
    )
}

const SuggestedPeople = () => {
    const [suggested, setSuggested] = useState([])
    const [refreshing, setRefreshing] = useState(false)

    const fetchSuggested = async () => {
        try {
            const res = await authApiClient.get('/users/')
            setSuggested(res.data.slice(0, 5))
        } catch {}
    }

    useEffect(() => {
        fetchSuggested()
    }, [])

    const onRefresh = async () => {
        setRefreshing(true)
        await fetchSuggested()
        setRefreshing(false)
    }

    return (
        <FlatList
            data={suggested}
            keyExtractor={(item) => `suggested-${item.id}`}
            renderItem={({ item }) => <PersonCard key={`suggested-${item.id}`} item={item} />}
            scrollEnabled={false}
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

export default SearchPage