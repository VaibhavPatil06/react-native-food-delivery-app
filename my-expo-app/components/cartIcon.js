import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { themeColor } from 'theme';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { selectCartItems, selectCartTotal } from 'slices/cartSlice';

export default function CartIcon() {
    const navigation = useNavigation()
    const cartItems = useSelector(selectCartItems);
    const cartTotal = useSelector(selectCartTotal)
    if (!cartItems.length) return;
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 20,
        zIndex: 50,
        width: '100%',
      }}>
      <TouchableOpacity
        onPress={() => navigation.navigate('Cart')}
        style={{
          backgroundColor: themeColor.bgColor(1),
          marginHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: 999,
          paddingHorizontal: 16,
          paddingVertical: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 5,
        }}>
        <View
          style={{
            paddingVertical: 4,
            paddingHorizontal: 16,
            borderRadius: 999,
            backgroundColor: 'rgba(255,255,255,1)',
          }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '800',
              color: themeColor.bgColor(1),
            }}>
            {cartItems.length}
          </Text>
        </View>

        <Text
          style={{
            flex: 1,
            textAlign: 'center',
            fontWeight: '800',
            color: 'white',
            fontSize: 18,
          }}>
          View Cart
        </Text>

        <Text
          style={{
            fontWeight: '800',
            color: 'white',
            fontSize: 18,
          }}>
          ${cartTotal}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
