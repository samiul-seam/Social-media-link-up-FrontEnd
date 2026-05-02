import { useState, useCallback, useEffect, useRef } from 'react'
import authApiClient from '../services/auth-api-client'
import useAuthContext from './useAuthContext'

const WS_BASE = 'ws://192.168.10.40:8000'

const useNotification = () => {
    const { authTokens } = useAuthContext()
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(true)
    const wsRef = useRef(null)

    const fetchNotifications = async (showLoading = true) => {
        if (showLoading) setLoading(true)
        try {
            const res = await authApiClient.get('/notification/')
            setNotifications(res.data)
            const total = res.data.filter(n => !n.is_read).length
            setUnreadCount(total)
        } catch (err) {
            console.log('fetchNotifications error:', err)
        } finally {
            if (showLoading) setLoading(false)
        }
    }

    // initial fetch
    useEffect(() => {
        fetchNotifications(true)
    }, [])

    // WebSocket
    useEffect(() => {
        if (!authTokens?.access) return

        let reconnectTimeout = null
        let isMounted = true

        const connectWS = () => {
            if (!isMounted) return

            const ws = new WebSocket(`${WS_BASE}/ws/notifications/?token=${authTokens.access}`)
            wsRef.current = ws

            ws.onopen = () => console.log('Notifications WS connected ✓')

            ws.onmessage = (e) => {
                const data = JSON.parse(e.data)

                if (data.type === 'notification') {
                    const newNotification = {
                        id: data.notification_id,
                        notification_type: data.notification_type,
                        sender: data.sender_id,
                        sender_name: data.sender_name,
                        post_id: data.post_id,
                        text: data.text,
                        url: data.url,
                        is_read: false,
                        created_at: data.created_at,
                    }
                    setNotifications(prev => {
                        if (prev.find(n => n.id === newNotification.id)) return prev
                        return [newNotification, ...prev]
                    })
                    setUnreadCount(prev => prev + 1)
                }
            }

            ws.onerror = (e) => console.log('Notifications WS error:', e)

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

    const markAsRead = async (id) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
        try {
            await authApiClient.patch(`/notification/${id}/mark_read/`)
        } catch (err) {
            console.log('mark_read error:', err)
        }
    }

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        setUnreadCount(0)
    }

    return {
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllRead,
    }
}

export default useNotification