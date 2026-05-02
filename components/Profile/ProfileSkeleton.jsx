import { View, Animated } from 'react-native'
import { useEffect, useRef } from 'react'

const ProfileSkeleton = () => {
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
        <Animated.View style={{ opacity }} className="flex-1 bg-white">

            {/* Avatar + Stats */}
            <View className="px-4 pt-6 pb-4">
                <View className="flex-row items-center gap-12">

                    {/* Avatar */}
                    <View className="w-20 h-20 rounded-full bg-gray-200" />

                    {/* Stats */}
                    <View className="flex-1 gap-2">
                        <View className="w-28 h-3 rounded-full bg-gray-200" />
                        <View className="flex-row gap-6 mt-2">
                            <View className="items-center gap-1">
                                <View className="w-8 h-6 rounded bg-gray-200" />
                                <View className="w-10 h-3 rounded bg-gray-200" />
                            </View>
                            <View className="items-center gap-1">
                                <View className="w-8 h-6 rounded bg-gray-200" />
                                <View className="w-16 h-3 rounded bg-gray-200" />
                            </View>
                            <View className="items-center gap-1">
                                <View className="w-8 h-6 rounded bg-gray-200" />
                                <View className="w-16 h-3 rounded bg-gray-200" />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Bio */}
                <View className="mt-4 gap-2">
                    <View className="w-48 h-3 rounded-full bg-gray-200" />
                    <View className="w-36 h-3 rounded-full bg-gray-200" />
                </View>

                {/* Buttons */}
                <View className="flex-row gap-3 mt-4">
                    <View className="flex-1 h-9 rounded-lg bg-gray-200" />
                    <View className="flex-1 h-9 rounded-lg bg-gray-200" />
                </View>
            </View>

            {/* Divider */}
            <View className="border-t border-gray-200" />

            {/* Posts Grid */}
            <View className="flex-row flex-wrap">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <View
                        key={i}
                        style={{ width: '33.33%', aspectRatio: 1, padding: 1 }}
                        className="bg-gray-200"
                    />
                ))}
            </View>
        </Animated.View>
    )
}

export default ProfileSkeleton