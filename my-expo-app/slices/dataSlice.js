import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchCategories, fetchFeatured } from '../api/api';

export const getCategories = createAsyncThunk(
  'data/getCategories',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchCategories();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getFeatured = createAsyncThunk('data/getFeatured', async (_, { rejectWithValue }) => {
  try {
    const data = await fetchFeatured();
    return data;
  } catch (error) {
    return rejectWithValue(error.message);
  }
});

const dataSlice = createSlice({
  name: 'data',
  initialState: {
    categories: [],
    featured: [],
    loading: false,
    error: null,
  },
  reducers: {
    resetDataError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(getCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getFeatured.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFeatured.fulfilled, (state, action) => {
        state.loading = false;
        state.featured = action.payload;
      })
      .addCase(getFeatured.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetDataError } = dataSlice.actions;
export const selectCategories = (state) => state.data.categories;
export const selectFeatured = (state) => state.data.featured;
export const selectDataLoading = (state) => state.data.loading;
export const selectDataError = (state) => state.data.error;

export default dataSlice.reducer;
