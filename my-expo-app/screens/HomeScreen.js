import { View, TextInput, Text, ScrollView, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { MapPin, Search, Sliders, ShoppingBag } from 'react-native-feather';
import { themeColor } from 'theme';
import Categories from 'components/categories';
import FeaturedRow from 'components/featuredRow';
import { useDispatch, useSelector } from 'react-redux';
import { getCategories, getFeatured } from 'slices/dataSlice';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const dispatch = useDispatch();
  const { categories, featured, loading } = useSelector((state) => state.data);
  const navigation = useNavigation();
  useEffect(() => {
    dispatch(getCategories());
    dispatch(getFeatured());
  }, [dispatch]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar barStyle="dark-content" />

      {/* Search Bar */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 10,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        {/* Input Field with Location */}
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#f3f4f6', // gray-100
            padding: 12,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: '#e5e7eb', // border-gray-200
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          }}>
          <Search height={24} width={24} stroke="gray" />
          <TextInput
            placeholder="Search for restaurants, cuisines..."
            style={{
              marginLeft: 12,
              flex: 1,
              fontSize: 16,
              color: '#1f2937', // text-gray-800
            }}
            placeholderTextColor="#888"
          />
          {/* Location */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderLeftWidth: 2,
              borderLeftColor: '#d1d5db', // gray-300
              paddingLeft: 8,
              marginLeft: 8,
            }}>
            <MapPin height={20} width={20} stroke="gray" />
            <Text style={{ color: '#4b5563', marginLeft: 4 }}>Mumbai, India</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('MyOrders')}
          style={{
            marginLeft: 12,
            padding: 10,
            borderRadius: 20,
            backgroundColor: themeColor.bgColor(0.2),
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ShoppingBag height={25} width={25} stroke={themeColor.bgColor(1)} />
        </TouchableOpacity>
        {/* Slider Icon Button */}
        <View
          style={{
            marginLeft: 12,
            padding: 14,
            borderRadius: 900,
            backgroundColor: themeColor.bgColor(1), // gray-300
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Sliders height={25} width={25} strokeWidth={2.5} stroke="white" />
        </View>
      </View>
      {/* main content bar */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 20,
          paddingTop: 15,
        }}>
        {categories && <Categories categories={categories.categories} />}

        {/* featured Section */}
        <View style={{ marginTop: 15 }}>
          {featured &&
            featured?.data?.map((item, index) => (
              <FeaturedRow
                key={index}
                title={item.title}
                restaurants={item.restaurants}
                description={item.description}
              />
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
