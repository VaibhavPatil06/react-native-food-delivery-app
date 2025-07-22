import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { featured } from '../constants/index';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { themeColor } from 'theme';
import * as Icon from 'react-native-feather';
import { useDispatch, useSelector } from 'react-redux';
import { selectRestaurant } from 'slices/restaurantSlice';
import { clearCart } from 'slices/cartSlice';
import { CommonActions } from '@react-navigation/native';

export default function DeliveryScreen() {
  const restaurant = useSelector(selectRestaurant);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const cancelOrder = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      })
    );
    dispatch(clearCart());
  };
  if (!restaurant) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }
  (restaurant)
  return (
    <View style={{ flex: 1 }}>
      <MapView
        initialRegion={{
          latitude: restaurant.latitude,
          longitude: restaurant.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        style={{ flex: 1 }}
        mapType="standard">
        <Marker
          coordinate={{
            latitude: restaurant.latitude,
            longitude: restaurant.longitude,
          }}
          title={restaurant.name}
          description={restaurant.description}
          pinColor={themeColor.bgColor(1)}
        />
      </MapView>

      <View
        style={{
          position: 'relative',
          marginTop: -48,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          backgroundColor: 'white',
          paddingHorizontal: 20,
          paddingTop: 40,
        }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#4B5563' }}>
              Estimated Arrival
            </Text>
            <Text style={{ fontSize: 28, fontWeight: '800', color: '#4B5563' }}>20-30 Minutes</Text>
            <Text style={{ marginTop: 8, fontWeight: '600', color: '#4B5563' }}>
              Your order is on its way!
            </Text>
          </View>
          <Image style={{ width: 96, height: 96 }} source={require('../assets/delivery.png')} />
        </View>

        <View
          style={{
            backgroundColor: themeColor.bgColor(0.8),
            marginHorizontal: 8,
            marginVertical: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: 999,
            padding: 8,
          }}>
          <View
            style={{
              backgroundColor: 'rgba(225,225,225,0.4)',
              borderRadius: 999,
              padding: 4,
            }}>
            <Image
              style={{ width: 64, height: 64, borderRadius: 999 }}
              source={require('../assets/bike.png')}
            />
          </View>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: 'white' }}>Shubham</Text>
            <Text style={{ fontWeight: '600', color: 'white' }}>Your Rider</Text>
          </View>
          <View style={{ marginRight: 12, flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              style={{
                backgroundColor: 'white',
                padding: 10,
                borderRadius: 999,
                marginRight: 8,
              }}>
              <Icon.Phone
                width={24}
                height={24}
                fill={themeColor.bgColor(1)}
                stroke={themeColor.bgColor(1)}
                strokeWidth={2}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={cancelOrder}
              style={{
                backgroundColor: 'white',
                padding: 10,
                borderRadius: 999,
              }}>
              <Icon.X
                width={24}
                height={24}
                fill={themeColor.bgColor(1)}
                stroke={'red'}
                strokeWidth={2}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
