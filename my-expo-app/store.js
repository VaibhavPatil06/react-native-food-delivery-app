import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import cartReducer from './slices/cartSlice';
import restaurantReducer from './slices/restaurantSlice';
import authReducer from './slices/authSlice';
import dataReducer from './slices/dataSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'],
};

const persistedReducer = persistReducer(persistConfig, authReducer);

// Create a function to initialize the store
const initializeStore = () => {
  return configureStore({
    reducer: {
      cart: cartReducer,
      restaurant: restaurantReducer,
      auth: persistedReducer,
      data: dataReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};

// Initialize store and persistor
const store = initializeStore();
const persistor = persistStore(store);

export { store, persistor };
