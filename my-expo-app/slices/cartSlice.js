import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

const initialState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const existingItem = state.items.find((item) => item._id === action.payload._id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({
          ...action.payload,
          quantity: 1, // Track quantity per item
        });
      }
    },
    removeFromCart: (state, action) => {
      const existingItem = state.items.find((item) => item._id === action.payload._id);
      if (existingItem) {
        if (existingItem.quantity > 1) {
          existingItem.quantity -= 1;
        } else {
          state.items = state.items.filter((item) => item._id !== action.payload._id);
        }
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartItemsByDishId = (state, dishId) =>
  state.cart.items.filter((item) => item._id === dishId);
export const selectCartTotal = (state) =>
  state.cart.items.reduce((total, item) => total + item.price, 0);

export default cartSlice.reducer;
