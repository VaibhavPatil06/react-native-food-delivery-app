import { View, Text, Image } from 'react-native';
import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

export default function OrderPrepairingScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Delivery');
    }, 3000); // 3 seconds delay

    return () => clearTimeout(timer); // Cleanup timer
  }, [navigation]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Image
        source={require('../assets/parcel.png')}
        style={{
          height: 320,
          width: 320,
          resizeMode: 'contain',
        }}
      />
      <Text style={{ fontSize: 18, marginTop: 20, color: '#333' }}>Preparing your order...</Text>
    </View>
  );
}
