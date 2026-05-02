import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

const BASE_WS_URL = 'ws://192.168.10.40:8000';

export const useNotifications = (onNotification, onMessageNotification) => {
  const ws = useRef(null);
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!token) return;

    ws.current = new WebSocket(`${BASE_WS_URL}/ws/notifications/?token=${token}`);

    ws.current.onopen = () => {
      console.log('Notifications connected');
    };

    ws.current.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === 'notification') {
        // like, comment, follow, reply
        onNotification?.(data);
      }

      if (data.type === 'message_notification') {
        // new message
        onMessageNotification?.(data);
      }
    };

    ws.current.onerror = (e) => {
      console.error('Notifications WS error:', e.message);
    };

    ws.current.onclose = () => {
      console.log('Notifications disconnected');
    };

    return () => {
      ws.current?.close();
    };
  }, [token]);
};