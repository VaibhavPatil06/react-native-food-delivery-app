import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import React from 'react';
import { themeColor } from 'theme';
import RestaurantCard from './restaurantCard';

export default function FeaturedRow({ title, description, restaurants }) {
  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
        }}>
        <View>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{title}</Text>
          <Text style={{ color: '#6B7280', fontSize: 12 }}>{description}</Text>
        </View>
        <TouchableOpacity>
          <Text style={{ color: themeColor.text, fontWeight: '600' }}>See All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 15,
        }}
        style={{ overflow: 'visible', paddingVertical: 20 }}>
        {restaurants.map((restaurant, index) => (
          <RestaurantCard item={restaurant} key={index} />
        ))}
      </ScrollView>
    </View>
  );
}
