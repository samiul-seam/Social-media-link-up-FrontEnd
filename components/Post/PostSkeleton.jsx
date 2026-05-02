import { View, Animated } from 'react-native'
import { useEffect, useRef } from 'react'

const PostSkeleton = () => {
    const opacity = useRef(new Animated.Value(0.3)).current

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start()
    }, [])

    return (
        <Animated.View style={{ opacity }} className="bg-white border-b border-gray-200 mb-3">
            {/* User Info */}
            <View className="flex-row items-center px-3 py-2">
                <View className="w-10 h-10 rounded-full bg-gray-200" />
                <View className="ml-3 gap-1">
                    <View className="w-32 h-3 rounded-full bg-gray-200" />
                    <View className="w-20 h-2 rounded-full bg-gray-200 mt-1" />
                </View>
            </View>

            {/* Image placeholder */}
            <View className="w-full h-64 bg-gray-200" />

            {/* Caption */}
            <View className="px-3 py-2 gap-2">
                <View className="w-full h-3 rounded-full bg-gray-200" />
                <View className="w-3/4 h-3 rounded-full bg-gray-200" />
            </View>

            {/* Actions */}
            <View className="flex-row justify-around px-4 py-3 border-t border-gray-100">
                <View className="w-14 h-4 rounded-full bg-gray-200" />
                <View className="w-14 h-4 rounded-full bg-gray-200" />
                <View className="w-14 h-4 rounded-full bg-gray-200" />
            </View>
        </Animated.View>
    )
}

export default PostSkeleton