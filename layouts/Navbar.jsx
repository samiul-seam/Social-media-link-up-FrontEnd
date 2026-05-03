import { Text, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { useInboxContext } from '../context/InboxContext'

const Navbar = () => {
  const { unreadCount } = useInboxContext()

  return (
    <View className="px-6 py-4 border-b border-gray-200">
      <View className="flex-row justify-between items-center">
        <TouchableOpacity onPress={() => router.push('/')}>
          <Text className="text-xl font-bold text-blue-500">LinkUp</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/inbox')} className="relative">
          <Text className="text-2xl">💬</Text>
          {unreadCount > 0 && (
            <View className="absolute -top-2 -right-2 bg-red-500 rounded-full min-w-[20px] h-5 items-center justify-center px-1">
              <Text className="text-white text-xs font-bold leading-none">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default Navbar