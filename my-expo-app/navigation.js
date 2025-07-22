import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BACKEND_URL } from '@env';
// Screens
import CartScreen from 'screens/CartScreen';
import DeliveryScreen from 'screens/DeliveryScreen';
import HomeScreen from 'screens/HomeScreen';
import LoginScreen from 'screens/LoginScreen';
import OrderPrepairingScreen from 'screens/OrderPrepairingScreen';
import RestaurantScreen from 'screens/RestaurantScreen';
import SignUpScreen from 'screens/SignUpScreen';
import { selectAccessToken, selectCurrentUser } from 'slices/authSlice';
import MyOrdersScreen from 'screens/MyOrdersScreen';
import OrderDetailScreen from 'screens/OrderDetailScreen';
import FillRestaurantDetailsScreen from 'screens/FillRestaurantDetailsScreen';
import axios from 'axios';
import RestaurantOwnerHomePage from 'screens/RestaurantOwnerHomePage';

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="SignUp" component={SignUpScreen} />
  </Stack.Navigator>
);

const AppStack = ({ isRestaurantOwner, hasRestaurantProfile }) => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    {isRestaurantOwner ? (
      hasRestaurantProfile ? (
        <>
          <Stack.Screen name="RestaurantOwnerHomePage" component={RestaurantOwnerHomePage} />
        </>
      ) : (
        <Stack.Screen name="FillRestaurantDetails" component={FillRestaurantDetailsScreen} />
      )
    ) : (
      <>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Restaurant" component={RestaurantScreen} />
        <Stack.Screen name="Cart" options={{ presentation: 'modal' }} component={CartScreen} />
        <Stack.Screen name="Delivery" component={DeliveryScreen} />
        <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
        <Stack.Screen
          name="OrderPrepairing"
          options={{ presentation: 'fullScreenModal' }}
          component={OrderPrepairingScreen}
        />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      </>
    )}
  </Stack.Navigator>
);

const Navigation = () => {
  const user = useSelector(selectCurrentUser);
  const accessToken = useSelector(selectAccessToken);
  const [hasRestaurantProfile, setHasRestaurantProfile] = useState(false);
  const [isRestaurantOwner, setIsRestaurantOwner] = useState(false);

  useEffect(() => {
    const checkRestaurantProfile = async () => {
      if (user?.role === 'restaurantOwner') {
        setIsRestaurantOwner(true);
        try {
          const response = await axios.get(`${BACKEND_URL}/featured/my`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (response.data?.restaurant) {
            setHasRestaurantProfile(true);
          } else {
            setHasRestaurantProfile(false);
          }
        } catch (err) {
          setHasRestaurantProfile(false);
        }
      } else {
        setIsRestaurantOwner(false);
      }
    };

    checkRestaurantProfile();
  }, [user]);

  return (
    <NavigationContainer>
      {user ? (
        <AppStack
          isRestaurantOwner={isRestaurantOwner}
          hasRestaurantProfile={hasRestaurantProfile}
        />
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};

export default Navigation;
