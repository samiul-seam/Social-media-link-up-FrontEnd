import { View, Text, TouchableOpacity, ScrollView, FlatList, Modal, Pressable, ActivityIndicator, RefreshControl } from 'react-native'
import { Image } from 'expo-image'
import { router, useFocusEffect } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useCallback, useState } from 'react'
import useAuthContext from '../../hooks/useAuthContext'
import defaultImg from '../../assets/default_img.jpg'
import authApiClient from '../../services/auth-api-client'
import ProfileSkeleton from './ProfileSkeleton'

const StatItem = ({ count, label }) => (
  <View className="items-center">
    <Text className="text-3xl font-bold text-gray-800">{count}</Text>
    <Text className="text-xl text-gray-500">{label}</Text>
  </View>
)

const ProfileScreen = ({ userId = null }) => {
  const { user: currentUser, logOutUser } = useAuthContext()
  const [menuVisible, setMenuVisible] = useState(false)
  const [posts, setPosts] = useState([])
  const [profileUser, setProfileUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [following, setFollowing] = useState(false)
  const [followId, setFollowId] = useState(null)
  const [followLoading, setFollowLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  

  const isOwner = !userId || userId === currentUser?.id

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    try {
      if (isOwner) {
        const res = await authApiClient.get('/posts/my_posts/')
        setPosts(res.data)
        setProfileUser(currentUser)
      } else {
        const [userRes, postsRes, followRes] = await Promise.all([
          authApiClient.get(`/users/${userId}/`),
          authApiClient.get(`/posts/user_posts/?user_id=${userId}`),
          authApiClient.get(`/follows/?followed=${userId}`),
        ])
        setProfileUser(userRes.data)
        const uniquePosts = postsRes.data.filter(
          (post, index, self) => index === self.findIndex(p => p.id === post.id)
        )
        setPosts(uniquePosts)
        if (followRes.data.length > 0) {
          setFollowing(true)
          setFollowId(followRes.data[0].id)
        } else {
          setFollowing(false)
          setFollowId(null)
        }
      }
    } catch (err) {
      console.log('fetchProfile error:', err)
    } finally {
      setLoading(false)
    }
  }, [userId, isOwner])

  useFocusEffect(
    useCallback(() => {
      fetchProfile()
    }, [fetchProfile])
  )

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchProfile()
    setRefreshing(false)
  }

  const handleFollow = async () => {
    setFollowLoading(true)
    try {
      if (following) {
        await authApiClient.delete(`/follows/${followId}/`)
        setFollowing(false)
        setFollowId(null)
        setProfileUser(prev => ({ ...prev, followers_count: prev.followers_count - 1 }))
      } else {
        const res = await authApiClient.post('/follows/', {
          following: userId
        })
        setFollowing(true)
        setFollowId(res.data.id)
        setProfileUser(prev => ({ ...prev, followers_count: prev.followers_count + 1 }))
      }
    } catch (err) {
      console.log('Follow error:', err)
    } finally {
      setFollowLoading(false)
    }
  }

  const handleMessage = async () => {
    try {
      const res = await authApiClient.post('/inboxes/', { user2: userId })
      router.push({
        pathname: '/Chat',
        params: { chatId: res.data.id, userId: currentUser.id }
      })
    } catch (err) {
      const existingId = err?.response?.data?.id
      if (existingId) {
        router.push({
          pathname: '/Chat',
          params: { chatId: existingId, userId: currentUser.id }
        })
      } else {
        console.log('Message error:', err)
      }
    }
  }

  const getDisplayName = () => {
    if (!profileUser) return ''
    if (isOwner) return `${profileUser.first_name} ${profileUser.last_name}`
    return profileUser.full_name ?? `${profileUser.first_name ?? ''} ${profileUser.last_name ?? ''}`
  }

  if (!profileUser || loading) return <ProfileSkeleton />


  const StatItem = ({ count, label, onPress }) => (
    <TouchableOpacity
      className="items-center"
      onPress={onPress}
      disabled={!onPress}
    >
      <Text className="text-3xl font-bold text-gray-800">{count}</Text>
      <Text className="text-xl text-gray-500">{label}</Text>
    </TouchableOpacity>
  )


  return (
    <ScrollView
      className="flex-1 bg-white"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#3b82f6']}
          tintColor="#3b82f6"
        />
      }
    >

      {/* Back button for other user profile */}
      {!isOwner && (
        <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text className="ml-3 font-semibold text-gray-800 text-base">
            {getDisplayName()}
          </Text>
        </View>
      )}

      <View className="px-4 pt-6 pb-4">

        {/* Avatar + Stats Row */}
        <View className="flex-row items-center gap-12">
          <Image
            source={profileUser.profile_picture
              ? { uri: profileUser.profile_picture }
              : defaultImg}
            style={{ width: 80, height: 80, borderRadius: 40 }}
          />

          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-800 mb-1">
              {getDisplayName()}
            </Text>
            <View className="flex-row gap-6">
              <StatItem count={posts.length} label="Posts" />
              <StatItem
                count={profileUser.followers_count ?? 0}
                label="Followers"
                onPress={() => router.push({ pathname: '/FollowList', params: { type: 'followers' } })}
              />
              <StatItem
                count={profileUser.following_count ?? 0}
                label="Following"
                onPress={() => router.push({ pathname: '/FollowList', params: { type: 'following' } })}
              />
            </View>
          </View>

          {/* menu — only for owner */}
          {isOwner && (
            <TouchableOpacity onPress={() => setMenuVisible(true)}>
              <Ionicons name="ellipsis-vertical" size={22} color="black" />
            </TouchableOpacity>
          )}
        </View>

        {/* Owner menu modal */}
        {isOwner && (
          <Modal transparent visible={menuVisible} animationType="fade">
            <Pressable className="flex-1" onPress={() => setMenuVisible(false)}>
              <View className="absolute right-4 top-16 bg-white rounded-lg shadow-lg p-2 w-36">
                <TouchableOpacity
                  className="p-3"
                  onPress={() => { setMenuVisible(false); router.push('/settings') }}
                >
                  <Text>Settings</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="p-3"
                  onPress={() => { setMenuVisible(false); logOutUser() }}
                >
                  <Text className="text-red-500">Logout</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Modal>
        )}

        {/* Bio */}
        {profileUser.bio ? (
          <View className="mt-4">
            <Text className="text-gray-600 text-sm">{profileUser.bio}</Text>
          </View>
        ) : null}

        {/* Buttons */}
        <View className="flex-row gap-3 mt-4">
          {isOwner ? (
            <>
              <TouchableOpacity
                onPress={() => router.push('/editProfile')}
                className="flex-1 border border-gray-300 rounded-lg py-2 items-center"
              >
                <Text className="font-semibold text-gray-700 text-sm">Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-blue-500 rounded-lg py-2 items-center">
                <Text className="font-semibold text-white text-sm">Share Profile</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                onPress={handleFollow}
                disabled={followLoading}
                className={`flex-1 rounded-lg py-2 items-center ${following
                  ? 'border border-gray-300'
                  : 'bg-blue-500'
                  }`}
              >
                {followLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={following ? '#374151' : '#fff'}
                  />
                ) : (
                  <Text className={`font-semibold text-sm ${following ? 'text-gray-700' : 'text-white'}`}>
                    {following ? 'Following' : 'Follow'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleMessage}
                className="flex-1 border border-gray-300 rounded-lg py-2 items-center"
              >
                <Text className="font-semibold text-gray-700 text-sm">Message</Text>
              </TouchableOpacity>

              <TouchableOpacity className="border border-gray-300 rounded-lg py-2 px-3 items-center">
                <Ionicons name="share-outline" size={18} color="#374151" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Divider */}
      <View className="border-t border-gray-200" />

      {/* Posts Grid */}
      {loading ? (
        <View style={{ height: 300 }} className="justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : posts.length > 0 ? (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{ width: '33.33%', padding: 1 }}
              onPress={() => router.push({
                pathname: '/PostDetailScreen',
                params: { post: JSON.stringify(item) }
              })}
            >
              {item.images?.length > 0 ? (
                <Image
                  source={{ uri: item.images[0].image }}
                  style={{ width: '100%', aspectRatio: 1 }}
                  contentFit="cover"
                />
              ) : (
                <View
                  style={{ width: '100%', aspectRatio: 1 }}
                  className="bg-gray-50 border border-gray-100 justify-center items-center px-2"
                >
                  <Text className="text-gray-600 text-xs text-center" numberOfLines={4}>
                    {item.caption || '...'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      ) : (
        <View className="flex justify-center items-center mt-10">
          <Text className="text-gray-500">No posts yet</Text>
        </View>
      )}
    </ScrollView>
  )
}

export default ProfileScreen