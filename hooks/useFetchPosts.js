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
            setPosts(res.data)
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