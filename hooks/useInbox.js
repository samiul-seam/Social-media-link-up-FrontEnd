import { useState, useEffect, useRef } from 'react'
import authApiClient from '../services/auth-api-client'
import useAuthContext from './useAuthContext'

const WS_BASE = 'wss://social-media-link-up-backend-production.up.railway.app'

const useInbox = () => {
    const { authTokens } = useAuthContext()
    const [chats, setChats] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const wsRef = useRef(null)

    const fetchChatList = async (showLoading = true) => {
        if (showLoading) setLoading(true)
        try {
            const res = await authApiClient.get('/inboxes/')
            setChats(res.data)
            const total = res.data.filter(c => c.unread_count > 0).length
            setUnreadCount(total)
        } catch (err) {
            console.log('fetchChatList error:', err)
        } finally {
            if (showLoading) setLoading(false)
        }
    }

    useEffect(() => {
        fetchChatList(true)
    }, [])

    useEffect(() => {
        if (!authTokens?.access) return

        let reconnectTimeout = null
        let isMounted = true

        const connectWS = () => {
            if (!isMounted) return

            const ws = new WebSocket(`${WS_BASE}/ws/inbox/?token=${authTokens.access}`)
            wsRef.current = ws

            ws.onopen = () => console.log('Inbox WS connected ✓')

            ws.onmessage = (e) => {
                const data = JSON.parse(e.data)

                setChats((prevChats) => {
                    const chatIndex = prevChats.findIndex(c => c.id === data.chat_id)

                    if (chatIndex > -1) {
                        const updatedChat = {
                            ...prevChats[chatIndex],
                            last_message: {
                                ...prevChats[chatIndex].last_message,
                                message: data.message,
                                created_at: data.created_at,
                                is_read: false,
                                sender_id: data.sender_id,
                            },
                            unread_count: data.unread_count,
                            updated_at: data.created_at,
                        }
                        const otherChats = prevChats.filter(c => c.id !== data.chat_id)
                        const newChats = [updatedChat, ...otherChats]

                        // update unread count
                        const total = newChats.filter(c => c.unread_count > 0).length
                        setUnreadCount(total)

                        return newChats
                    }

                    fetchChatList(false)
                    return prevChats
                })
            }

            ws.onerror = (e) => console.log('Inbox WS error:', e)

            ws.onclose = () => {
                if (isMounted) {
                    reconnectTimeout = setTimeout(connectWS, 2000)
                }
            }
        }

        connectWS()

        return () => {
            isMounted = false
            clearTimeout(reconnectTimeout)
            wsRef.current?.close()
        }
    }, [authTokens?.access])

    const markAsRead = (chatId) => {
        setChats(prev =>
            prev.map(c => c.id === chatId ? { ...c, unread_count: 0 } : c)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
    }

    return { chats, setChats, unreadCount, loading, fetchChatList, markAsRead }
}

export default useInbox