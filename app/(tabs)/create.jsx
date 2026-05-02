import { useRouter } from 'expo-router'
import CreatePostPage from '../../components/CreatePost/CreatePostPage'

export default function CreatePostScreen() {
  const router = useRouter()

  return (
    <CreatePostPage
      onClose={() => router.replace('/(tabs)/')}
      onPost={() => router.replace('/(tabs)/')}
    />
  )
}