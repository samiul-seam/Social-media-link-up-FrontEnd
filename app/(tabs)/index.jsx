import Posts from '../../components/Post/Posts';
import Navbar from '../../layouts/Navbar';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function HomeScreen() {


  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <Navbar/>
      <Posts />
    </SafeAreaView>
  );
}