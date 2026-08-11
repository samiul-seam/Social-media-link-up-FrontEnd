import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux'; // or however you store your token

const BASE_WS_URL = process.env.EXPO_PUBLIC_WS_URL


export const useChat = (inboxId) => {
  const ws = useRef(null);
  const token = useSelector((state) => state.auth.token); // adjust to your store
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!inboxId || !token) return;

    ws.current = new WebSocket(`${BASE_WS_URL}/ws/chat/${inboxId}/?token=${token}`);

    ws.current.onopen = () => {
      setIsConnected(true);
    };

    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setMessages((prev) => [...prev, data]);
    };

    ws.current.onerror = (e) => {
      console.error('Chat WS error:', e.message);
    };

    ws.current.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      ws.current?.close();
    };
  }, [inboxId, token]);

  const sendMessage = (content) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ message: content }));
    }
  };

  return { messages, sendMessage, isConnected };
};