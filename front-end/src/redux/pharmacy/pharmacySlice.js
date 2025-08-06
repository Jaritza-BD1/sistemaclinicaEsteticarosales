// src/redux/pharmacy/pharmacySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as pharmacyApi from '../../services/pharmacyService';

// Thunks para operaciones CRUD de productos
export const fetchProducts = createAsyncThunk(
  'pharmacy/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await pharmacyApi.getAllProducts();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const createProduct = createAsyncThunk(
  'pharmacy/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const formattedData = pharmacyApi.formatFormDataForBackend(productData);
      const response = await pharmacyApi.createProduct(formattedData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const updateProduct = createAsyncThunk(
  'pharmacy/updateProduct',
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const formattedData = pharmacyApi.formatFormDataForBackend(productData);
      const response = await pharmacyApi.updateProduct(id, formattedData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'pharmacy/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await pharmacyApi.deleteProduct(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const getProductStats = createAsyncThunk(
  'pharmacy/getProductStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await pharmacyApi.getProductStats();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

export const getProductsByCategory = createAsyncThunk(
  'pharmacy/getProductsByCategory',
  async (category, { rejectWithValue }) => {
    try {
      const response = await pharmacyApi.getProductsByCategory(category);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.message);
    }
  }
);

const pharmacySlice = createSlice({
  name: 'pharmacy',
  initialState: {
    items: [], // Lista principal de productos
    stats: null, // Estadísticas de productos
    categoryProducts: [], // Productos por categoría
    status: 'idle', // Estado general: 'idle', 'loading', 'succeeded', 'failed'
    error: null, // Mensaje de error
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearProducts: (state) => {
      state.items = [];
    },
    clearCategoryProducts: (state) => {
      state.categoryProducts = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Casos para fetchProducts
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Casos para createProduct
      .addCase(createProduct.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Casos para updateProduct
      .addCase(updateProduct.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.atr_id_producto === action.payload.atr_id_producto);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Casos para deleteProduct
      .addCase(deleteProduct.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.atr_id_producto !== action.payload);
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Casos para getProductStats
      .addCase(getProductStats.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getProductStats.fulfilled, (state, action) => {
        state.stats = action.payload;
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(getProductStats.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Casos para getProductsByCategory
      .addCase(getProductsByCategory.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getProductsByCategory.fulfilled, (state, action) => {
        state.categoryProducts = action.payload;
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(getProductsByCategory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  clearProducts, 
  clearCategoryProducts 
} = pharmacySlice.actions;

export default pharmacySlice.reducer; 