import { createContext, useContext } from 'react'
import useInbox from '../hooks/useInbox'

const InboxContext = createContext()

export const InboxProvider = ({ children }) => {
    const inbox = useInbox()
    return (
        <InboxContext.Provider value={inbox}>
            {children}
        </InboxContext.Provider>
    )
}

export const useInboxContext = () => useContext(InboxContext)