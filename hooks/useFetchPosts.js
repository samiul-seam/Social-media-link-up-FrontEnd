import { useEffect, useRef, useState } from 'react'
import authApiClient from '../services/auth-api-client';

const useFetchPosts = () => {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const hasFetched = useRef(false)

    useEffect(() => {
        const fetchPosts = async () => {
            if (hasFetched.current) return
            hasFetched.current = true
            setIsLoading(true);

            try {
                const res = await authApiClient.get(`/posts`);
                const data = res.data;
                setPosts(data)
            } catch {
                console.log("something went wrong")
            } finally {
                setIsLoading(false)
            }
        }
        fetchPosts();
    }, [])

    return { posts, isLoading }
}

export default useFetchPosts
