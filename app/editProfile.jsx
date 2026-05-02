import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native'
import { Image } from 'expo-image'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import useAuthContext from '../hooks/useAuthContext'
import authApiClient from '../services/auth-api-client'
import defaultImg from '../assets/default_img.jpg'

export default function EditProfileScreen() {
    const { user, setUser } = useAuthContext()

    const [firstName, setFirstName] = useState(user?.first_name ?? '')
    const [lastName, setLastName] = useState(user?.last_name ?? '')
    const [bio, setBio] = useState(user?.bio ?? '')
    const [image, setImage] = useState(null)
    const [loading, setLoading] = useState(false)

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        })
        if (!result.canceled) {
            setImage(result.assets[0])
        }
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('first_name', firstName)
            formData.append('last_name', lastName)
            formData.append('bio', bio)
            formData.append('email', user.email)

            if (image) {
                formData.append('profile_picture', {
                    uri: image.uri,
                    type: image.mimeType ?? 'image/jpeg',
                    name: 'profile.jpg',
                })
            }

            const res = await authApiClient.put('/auth/users/me/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            setUser(prev => ({ ...prev, ...res.data }))
            Alert.alert('Success', 'Profile updated!')
            router.back()
        } catch (err) {
            console.log('FULL ERROR:', err)
            console.log('MESSAGE:', err.message)
            console.log('RESPONSE:', err.response)
            console.log('REQUEST:', err.request)
        } finally {
            setLoading(false)
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="ml-3 font-semibold text-gray-800 text-base flex-1">Edit Profile</Text>
                <TouchableOpacity onPress={handleSave} disabled={loading}>
                    {loading
                        ? <ActivityIndicator size="small" color="#3b82f6" />
                        : <Text className="text-blue-500 font-semibold">Save</Text>
                    }
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-4 py-6">
                {/* Avatar */}
                <View className="items-center mb-8">
                    <Image
                        source={image
                            ? { uri: image.uri }
                            : user?.profile_picture
                                ? { uri: user.profile_picture }
                                : defaultImg}
                        style={{ width: 90, height: 90, borderRadius: 45 }}
                    />
                    <TouchableOpacity onPress={pickImage} className="mt-3">
                        <Text className="text-blue-500 font-semibold">Change Photo</Text>
                    </TouchableOpacity>
                </View>

                {/* Fields */}
                <View className="gap-4">
                    <View>
                        <Text className="text-gray-500 text-xs mb-1">First Name</Text>
                        <TextInput
                            value={firstName}
                            onChangeText={setFirstName}
                            className="border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                            placeholder="First name"
                        />
                    </View>

                    <View>
                        <Text className="text-gray-500 text-xs mb-1">Last Name</Text>
                        <TextInput
                            value={lastName}
                            onChangeText={setLastName}
                            className="border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                            placeholder="Last name"
                        />
                    </View>

                    <View>
                        <Text className="text-gray-500 text-xs mb-1">Bio</Text>
                        <TextInput
                            value={bio}
                            onChangeText={setBio}
                            className="border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
                            placeholder="Write something about yourself..."
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}