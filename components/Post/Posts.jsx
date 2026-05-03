import { useRouter } from 'expo-router'
import { FlatList, View, RefreshControl } from 'react-native'
import { useState } from 'react'
import useFetchPosts from '../../hooks/useFetchPosts'
import PostCard from './PostCard'
import PostSkeleton from './PostSkeleton'

const Posts = () => {
  const { posts, isLoading, fetchPosts } = useFetchPosts() 
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchPosts()
    setRefreshing(false)
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1 }}>
        {[1, 2, 3].map((i) => (
          <PostSkeleton key={i} />
        ))}
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        extraData={posts}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onCommentPress={(post) => router.push({
              pathname: '/comments',
              params: { id: post.id, post: JSON.stringify(post) }
            })}
          />
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
    </View>
  )
}

export default Posts