import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import React, { useState } from 'react';

export default function Categories({ categories }) {
  const [activeCategory, setActiveCategory] = useState(null);
  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 15,
        }}>
        {categories?.map((category, index) => {
          let isActive = category.id === activeCategory;

          return (
            <View
              key={index}
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 24,
              }}>
              <TouchableOpacity
                onPress={() => setActiveCategory(category.id)}
                style={{
                  padding: 4,
                  borderRadius: 100,
                  backgroundColor: isActive ? '#4B5563' : '#E5E7EB', // gray-600 or gray-200
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}>
                <Image
                  source={{ uri: category.image }}
                  style={{
                    height: 45,
                    width: 45,
                    borderRadius: 100,
                  }}
                />
              </TouchableOpacity>
              <Text
                style={{
                  fontSize: 14,
                  marginTop: 6,
                  color: isActive ? '#1F2937' : '#6B7280', // text-gray-800 or text-gray-500
                  fontWeight: isActive ? '600' : '400',
                }}>
                {category.name}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
