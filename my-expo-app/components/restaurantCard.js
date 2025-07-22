import { View, Text, TouchableWithoutFeedback, Image } from 'react-native';
import React from 'react';
import { themeColor } from '../theme'; // make sure themeColor is imported
import MapIcon from 'react-native-vector-icons/Feather'; // example icon component
import { useNavigation } from '@react-navigation/native';
import { IMAGE_URL } from '@env';

export default function RestaurantCard({ item, index }) {
    const navigation = useNavigation()
  return (
    <TouchableWithoutFeedback onPress={() => navigation.navigate('Restaurant', { ...item })}>
      <View
        style={{
          marginRight: 24,
          backgroundColor: '#fff',
          borderRadius: 24,
          shadowColor: themeColor.bgColor(0.2),
          shadowOpacity: 0.3,
          shadowRadius: 7,
          shadowOffset: { width: 0, height: 3 },
          elevation: 5,
        }}>
        <Image
          style={{
            height: 144,
            width: 184,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          }}
          source={{ uri: `${IMAGE_URL}${item.image}` }}
        />
        <View style={{ paddingHorizontal: 12, paddingBottom: 16, gap: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', paddingTop: 8 }}>{item.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* Replace below with actual icon if needed */}
            <Image
              source={require('../assets/star.png')} // replace with actual icon
              style={{ height: 16, width: 16, marginRight: 4 }}
            />
            <Text style={{ fontSize: 12 }}>
              <Text style={{ color: 'green' }}>{item.stars}</Text>
              <Text style={{ color: 'gray' }}>
                {' '}
                ({item.reviews} reviews) ·{' '}
                <Text style={{ fontWeight: '600' }}>{item.category}</Text>
              </Text>
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MapIcon name="map-pin" size={15} color="gray" style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 12, color: 'gray' }}>Nearby {item.address}</Text>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
