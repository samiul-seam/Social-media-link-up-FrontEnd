import { useRouter } from 'expo-router'
import { FlatList, View } from 'react-native'
import useFetchPosts from '../../hooks/useFetchPosts'
import PostCard from './PostCard'
import PostSkeleton from './PostSkeleton'

const Posts = () => {
  const { posts, isLoading } = useFetchPosts()
  const router = useRouter()

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
      />
    </View>
  )
}

export default Posts