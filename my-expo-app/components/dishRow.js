import { View, Text, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import { themeColor } from 'theme';
import * as Icon from 'react-native-feather';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart, selectCartItemsByDishId } from 'slices/cartSlice';
import { IMAGE_URL } from '@env';

export default function DishRow({ item }) {
  const dispatch = useDispatch();
  const cartItem = useSelector((state) =>
    state.cart.items.find((cartItem) => cartItem._id === item._id)
  );

  const handleIncrease = () => {
    dispatch(addToCart({ ...item }));
  };

  const handleDecrease = () => {
    if (cartItem) {
      dispatch(removeFromCart({ _id: item._id }));
    }
  };
  const isMinusDisabled = !cartItem || cartItem.quantity <= 0;

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        backgroundColor: 'white',
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}>
      <Image
        style={{
          height: 100,
          width: 100,
          borderRadius: 12,
          marginRight: 12,
        }}
        source={{ uri: `${IMAGE_URL}${item.image}` }}
      />
      <View style={{ flex: 1 }}>
        <View style={{ marginBottom: 8 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#1F2937',
            }}>
            {item.name}
          </Text>
          <Text
            style={{
              color: '#6B7280',
              fontSize: 14,
              lineHeight: 20,
            }}>
            {item.description}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: themeColor.text,
            }}>
            ${item.price.toFixed(2)}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <TouchableOpacity
              onPress={handleDecrease}
              disabled={isMinusDisabled}
              style={{
                backgroundColor: isMinusDisabled ? '#E5E7EB' : themeColor.bgColor(1),
                borderRadius: 999,
                padding: 8,
              }}>
              <Icon.Minus
                strokeWidth={2}
                height={20}
                width={20}
                stroke={isMinusDisabled ? '#9CA3AF' : 'white'}
              />
            </TouchableOpacity>
            <Text
              style={{
                paddingHorizontal: 16,
                fontSize: 16,
                fontWeight: '600',
              }}>
              {cartItem?.quantity || 0}
            </Text>
            <TouchableOpacity
              onPress={handleIncrease}
              style={{
                backgroundColor: themeColor.bgColor(1),
                borderRadius: 999,
                padding: 8,
              }}>
              <Icon.Plus strokeWidth={2} height={20} width={20} stroke="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
