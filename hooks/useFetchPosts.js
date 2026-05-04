import { useEffect, useRef, useState } from 'react'
import authApiClient from '../services/auth-api-client';

const useFetchPosts = () => {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const hasFetched = useRef(false)

    const fetchPosts = async () => {
        setIsLoading(true);
        try {
            const res = await authApiClient.get(`/posts`);
            const uniquePosts = res.data.filter(
                (post, index, self) => index === self.findIndex(p => p.id === post.id)
            )
            setPosts(uniquePosts)
        } catch {
            console.log("something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (hasFetched.current) return
        hasFetched.current = true
        fetchPosts();
    }, [])

    return { posts, isLoading, fetchPosts }
}

export default useFetchPosts