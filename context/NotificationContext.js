import { createContext, useContext } from 'react'
import useNotification from '../hooks/useNotification'

const NotificationContext = createContext()

export const NotificationProvider = ({ children }) => {
    const notification = useNotification()
    return (
        <NotificationContext.Provider value={notification}>
            {children}
        </NotificationContext.Provider>
    )
}

export const useNotificationContext = () => useContext(NotificationContext)