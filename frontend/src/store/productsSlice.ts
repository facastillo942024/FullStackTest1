import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { checkoutApi } from '../api/checkoutApi';
import { extractApiErrorMessage } from '../api/client';
import type { Product } from '../api/types';

export interface ProductsState {
  items: Product[];
  selectedId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  items: [],
  selectedId: null,
  loading: false,
  error: null,
};

export const fetchProducts = createAsyncThunk<
  Product[],
  void,
  { rejectValue: string }
>('products/fetchAll', async (_arg, { rejectWithValue }) => {
  try {
    return await checkoutApi.getProducts();
  } catch (error) {
    return rejectWithValue(extractApiErrorMessage(error));
  }
});

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    selectProduct(state, action: PayloadAction<string>) {
      state.selectedId = action.payload;
    },
    /** Applies an updated product (e.g. after stock changed on the server). */
    upsertProduct(state, action: PayloadAction<Product>) {
      const idx = state.items.findIndex((p) => p.id === action.payload.id);
      if (idx >= 0) {
        state.items[idx] = action.payload;
      } else {
        state.items.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'No se pudieron cargar los productos';
      });
  },
});

export const { selectProduct, upsertProduct } = productsSlice.actions;
export default productsSlice.reducer;
