import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useAuthContext from '../../hooks/useAuthContext';
import { useEffect, useState } from 'react';
import authApiClient from '../../services/auth-api-client';
import useNotification from '../../hooks/useNotification';

const tabs = [
  { name: "index", title: "Home", icon: "home-outline" },
  { name: "search", title: "Search", icon: "search-outline" },
  { name: "create", title: "Create", icon: "add-circle-outline" },
  { name: "notifications", title: "Notifications", icon: "notifications-outline" },
  { name: "profile", title: "profile", icon: "person-outline" },
];

export default function TabLayout() {
  const { user, loading } = useAuthContext()
  const { unreadCount, markAllRead } = useNotification()

  if (loading) return null;
  if (!user) return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { paddingBottom: 2 },
        tabBarActiveTintColor: "#6366f1",
        tabBarInactiveTintColor: "#9ca3af",
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          listeners={tab.name === 'notifications' ? {
            tabPress: () => markAllRead()
          } : undefined}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name={tab.icon} size={size} color={color} />
            ),
            tabBarBadge: tab.name === 'notifications' && unreadCount > 0
              ? unreadCount > 9 ? '9+' : unreadCount
              : undefined,
            tabBarBadgeStyle: {
              backgroundColor: 'red',
              fontSize: 14,
              minWidth: 8,
              height: 16,
            },
          }}
        />
      ))}
    </Tabs>
  );
}