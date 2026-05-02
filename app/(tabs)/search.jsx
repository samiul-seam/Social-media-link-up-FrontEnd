import { SafeAreaView } from 'react-native-safe-area-context'
import SearchPage from '../../components/Search/SearchPage'

export default function SearchScreen() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center">
      <SearchPage />
    </SafeAreaView>
  )
}