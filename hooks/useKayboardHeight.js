import { useEffect, useRef } from 'react'
import { Animated, Keyboard, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const useKeyboardHeight = () => {
  const { bottom } = useSafeAreaInsets()
  const animatedHeight = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'

    const show = Keyboard.addListener(showEvent, (e) => {
      Animated.timing(animatedHeight, {
        toValue: Platform.OS === 'ios' 
      ? e.endCoordinates.height - bottom
      : e.endCoordinates.height,
        duration: 250,
        useNativeDriver: false,
      }).start()
    })

    const hide = Keyboard.addListener(hideEvent, () => {
      Animated.timing(animatedHeight, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start()
    })

    return () => {
      show.remove()
      hide.remove()
    }
  }, [bottom])

  return animatedHeight
}

export default useKeyboardHeight