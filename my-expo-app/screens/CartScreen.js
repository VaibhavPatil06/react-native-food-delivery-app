import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { themeColor } from 'theme';
import * as Icon from 'react-native-feather';
import { useDispatch, useSelector } from 'react-redux';
import { selectRestaurant } from 'slices/restaurantSlice';
import { removeFromCart, selectCartItems, selectCartTotal, clearCart } from 'slices/cartSlice';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { selectCurrentUser } from 'slices/authSlice';
import { placeOrder } from 'api/api';
import { IMAGE_URL } from '@env';

export default function CartScreen() {
  const user = useSelector(selectCurrentUser);
  const restaurant = useSelector(selectRestaurant);
  const navigation = useNavigation();
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);
  const [groupedItems, setGroupedItems] = useState({});
  const dispatch = useDispatch();
  const deliveryFee = 2;

  useEffect(() => {
    const items = cartItems.reduce((group, item) => {
      if (group[item._id]) {
        group[item._id].push(item);
      } else {
        group[item._id] = [item];
      }
      return group;
    }, {});
    setGroupedItems(items);
  }, [cartItems]);

  const handlePlaceOrder = async () => {
    try {
      const orderData = {
        restaurantId: restaurant._id,
        items: cartItems.map((item) => ({
          dishId: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: cartTotal,
        deliveryFee: 2,
        deliveryAddress: user.address, // Assuming user has address
        paymentMethod: 'Cash on Delivery', // Or get from payment screen
      };

      await placeOrder(orderData, user.token);
      dispatch(clearCart());
      navigation.navigate('OrderPrepairing');
    } catch (error) {
      alert('Failed to place order. Please try again.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          paddingTop: 16,
          paddingBottom: 12,
        }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            position: 'absolute',
            left: 20,
            top: 16,
            zIndex: 10,
            borderRadius: 999,
            padding: 8,
            backgroundColor: themeColor.bgColor(1),
          }}>
          <Icon.ArrowLeft strokeWidth={3} stroke="white" />
        </TouchableOpacity>
        <View>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 24,
              fontWeight: 'bold',
              marginTop: 8,
            }}>
            Your Cart
          </Text>
          <Text
            style={{
              textAlign: 'center',
              color: 'gray',
              marginBottom: 8,
            }}>
            {restaurant?.name}
          </Text>
        </View>
      </View>

      {/* Delivery Info */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
          backgroundColor: themeColor.bgColor(0.1),
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb',
        }}>
        <Image
          source={require('../assets/delivery.png')}
          style={{ height: 60, width: 60, borderRadius: 30 }}
        />
        <Text style={{ flex: 1, paddingLeft: 16, fontSize: 14 }}>Deliver in 20-30 minutes</Text>
        <TouchableOpacity>
          <Text
            style={{
              fontWeight: 'bold',
              color: themeColor.text,
              fontSize: 14,
            }}>
            Change
          </Text>
        </TouchableOpacity>
      </View>

      {/* Cart Items */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 20,
          paddingTop: 16,
          backgroundColor: 'white',
        }}>
        {Object.entries(groupedItems).map(([key, items]) => {
          let dish = items[0];
          return (
            <View
              key={key}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginHorizontal: 16,
                marginBottom: 12,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 16,
                backgroundColor: 'white',
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 2,
              }}>
              <Text
                style={{
                  fontWeight: 'bold',
                  color: themeColor.text,
                  marginRight: 8,
                  fontSize: 16,
                }}>
                {dish.quantity} x
              </Text>
              <Image
                source={{ uri: `${IMAGE_URL}${dish.image}` }}
                style={{
                  height: 50,
                  width: 50,
                  borderRadius: 25,
                  marginRight: 12,
                }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontWeight: 'bold',
                    color: '#4B5563',
                    fontSize: 16,
                  }}>
                  {dish.name}
                </Text>
                <Text
                  style={{
                    color: '#6B7280',
                    fontSize: 14,
                    marginTop: 2,
                  }}>
                  ${dish.price}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => dispatch(removeFromCart({ _id: dish._id }))}
                style={{
                  padding: 8,
                  borderRadius: 999,
                  backgroundColor: themeColor.bgColor(1),
                }}>
                <Icon.Minus strokeWidth={2} height={18} width={18} stroke="white" />
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      {/* Order Summary */}
      <View
        style={{
          backgroundColor: themeColor.bgColor(0.1),
          padding: 20,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}>
          <Text style={{ color: '#6B7280', fontSize: 16 }}>Subtotal</Text>
          <Text style={{ color: '#6B7280', fontSize: 16 }}>${cartTotal.toFixed(2)}</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}>
          <Text style={{ color: '#6B7280', fontSize: 16 }}>Delivery Fee</Text>
          <Text style={{ color: '#6B7280', fontSize: 16 }}>${deliveryFee.toFixed(2)}</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 20,
            borderTopWidth: 1,
            borderTopColor: '#e5e7eb',
            paddingTop: 12,
          }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Order Total</Text>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
            ${(cartTotal + deliveryFee).toFixed(2)}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handlePlaceOrder}
          disabled={cartItems.length === 0}
          style={{
            backgroundColor: cartItems.length > 0 ? themeColor.bgColor(1) : '#D1D5DB',
            paddingVertical: 14,
            borderRadius: 999,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text
            style={{
              color: 'white',
              fontSize: 18,
              fontWeight: 'bold',
            }}>
            Place Order
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
