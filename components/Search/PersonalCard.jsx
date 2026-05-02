import { useState, useEffect } from "react";
import { Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import defaultImg from "../../assets/default_img.jpg";
import authApiClient from "../../services/auth-api-client";
import { router } from "expo-router";

const PersonCard = ({ item }) => {
  const [following, setFollowing] = useState(false);
  const [followRecordId, setFollowRecordId] = useState(null); 
  const [loadingFollow, setLoadingFollow] = useState(false);

  useEffect(() => {
    authApiClient.get("follows/following/")
      .then(res => {
        const record = res.data.find(f => f.following === item.id);
        
        if (record) {
          setFollowing(true);
          setFollowRecordId(record.id);
        }
      })
      .catch((err) => console.log("Check follow error:", err));
  }, [item.id]);


  return (
    <TouchableOpacity
    onPress={()=> router.push({ pathname: '/UserProfile' , params: {
      userId: item.id }})}
    className="flex-row items-center px-4 py-3 gap-3">
      <Image
        source={item.profile_picture ? { uri: item.profile_picture } : defaultImg}
        style={{ width: 44, height: 44, borderRadius: 22 }}
        contentFit="cover"
      />

      <View className="flex-1">
        <Text className="text-gray-900 font-semibold text-sm">
          {item.full_name ? item.full_name : item.username}
          </Text>
        <Text className="text-gray-500 text-xs mt-0.5">
          {item.followers_count} followers · {item.following_count} following
        </Text>
      </View>

    </TouchableOpacity>
  );
};

export default PersonCard;