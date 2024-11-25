
import { Text, View,Image,StyleSheet,TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
    <View style={styles.circle}>
      <Image source={require('../assets/images/mainLogo.png')} style={styles.image} />
    </View>
    <View style={styles.maintext}>
    <Image source={require('../assets/images/title.png')} style={styles.image} />
    </View>
    <TouchableOpacity style={styles.arrow} onPress={() => router.push('/(tabs)/audio')}>
    <Image source={require('../assets/images/arrow.png')} style={styles.image} />
    </TouchableOpacity>
  </View>
  //   <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  //   <Text>Welcome to the Home Screen</Text>
  //   <Button
  //     title="Go to Audio"
  //     onPress={() => router.push('/(tabs)/audio')}
  //   />
  // </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDFCFF',
  },
  circle: {
    width: 200,
    height: 200,
    borderRadius: 75,
    marginBottom: 20,
  },
  maintext:{
    width: 245,
    height: 34,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'RubikRegular',
    marginBottom: 20,
  },
  arrow: {
    width: 30,
    height: 50,
    
  },
  arrowText: {
    fontSize: 20,
  },
});

