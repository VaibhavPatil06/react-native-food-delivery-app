import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import React, { useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { themeColor } from 'theme';
import DishRow from 'components/dishRow';
import Icon from 'react-native-vector-icons/Feather';
import CartIcon from 'components/cartIcon';
import { StatusBar } from 'expo-status-bar';
import { useDispatch, useSelector } from 'react-redux';
import { setRestaurant } from 'slices/restaurantSlice';
import { selectCartItems } from 'slices/cartSlice';
import { IMAGE_URL } from '@env';

export default function RestaurantScreen() {
  const { params } = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const item = params;

  useEffect(() => {
    if (item?._id) {
      dispatch(setRestaurant({ ...item }));
    }
  }, [item]);

  return (
    <View style={{ flex: 1 }}>
      <CartIcon />
      <StatusBar style="light" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Restaurant Header */}
        <View style={{ position: 'relative' }}>
          <Image
            source={{ uri: `${IMAGE_URL}${item.image}` }}
            style={{ width: '100%', height: 300 }}
            resizeMode="cover"
          />
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              position: 'absolute',
              top: 56,
              left: 16,
              backgroundColor: 'rgba(255,255,255,0.8)',
              padding: 8,
              borderRadius: 999,
              shadowColor: '#000',
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3,
            }}>
            <Icon name="arrow-left" size={20} color={themeColor.bgColor(1)} />
          </TouchableOpacity>
        </View>

        {/* Restaurant Info */}
        <View
          style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
            marginTop: -40,
            paddingTop: 24,
            paddingBottom: 20,
          }}>
          <View style={{ paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{item.name}</Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              <Image source={require('../assets/star.png')} style={{ height: 20, width: 20 }} />
              <Text style={{ fontSize: 14, marginLeft: 4 }}>
                <Text style={{ color: '#047857' }}>{item.stars}</Text>
                <Text style={{ color: '#374151' }}>
                  {' '}
                  ({item.reviews} reviews) •{' '}
                  <Text style={{ fontWeight: '600' }}>{item.categories}</Text>
                </Text>
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              <Icon name="map-pin" size={16} color="gray" />
              <Text style={{ color: '#6b7280', fontSize: 14, marginLeft: 4 }}>
                Nearby • {item.address}
              </Text>
            </View>
          </View>

          <Text
            style={{
              color: '#6b7280',
              marginTop: 12,
              paddingHorizontal: 20,
              lineHeight: 20,
            }}>
            {item.description}
          </Text>
        </View>

        {/* Menu Section */}
        <View style={{ backgroundColor: '#fff', paddingBottom: 40 }}>
          <Text
            style={{
              paddingHorizontal: 20,
              paddingVertical: 16,
              fontSize: 20,
              fontWeight: 'bold',
              borderBottomWidth: 1,
              borderBottomColor: '#f3f4f6',
            }}>
            Menu
          </Text>
    {Array.isArray(item.dishes) && item.dishes.length > 0 ? (
  item.dishes.map((dish, index) => <DishRow item={{ ...dish }} key={index} />)
) : (
  <Text style={{ paddingHorizontal: 20, color: 'gray' }}>No dishes found.</Text>
)}

        </View>
      </ScrollView>

      {/* Show cart button if items exist */}
      {cartItems.length > 0 && (
        <View
          style={{
            position: 'absolute',
            bottom: 20,
            left: 0,
            right: 0,
            alignItems: 'center',
          }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Cart')}
            style={{
              backgroundColor: themeColor.bgColor(1),
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 30,
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowRadius: 10,
              elevation: 5,
            }}>
            <Text
              style={{
                color: 'white',
                fontSize: 16,
                fontWeight: 'bold',
                marginRight: 8,
              }}>
              View Cart ({cartItems.length})
            </Text>
            <Icon name="shopping-cart" size={20} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
