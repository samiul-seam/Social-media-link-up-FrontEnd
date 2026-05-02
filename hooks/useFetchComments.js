import { useEffect, useState } from 'react'
import authApiClient from '../services/auth-api-client'

const useFetchComments = (postId, changeComments) => {
  const [comments, setComments] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!postId) return
 
    setIsLoading(true)
    authApiClient.get(`/posts/${postId}/comments`)
      .then((res) => setComments(res.data))
      .finally(() => setIsLoading(false))
  }, [postId, changeComments])

  return { comments, isLoading }
}

export default useFetchComments