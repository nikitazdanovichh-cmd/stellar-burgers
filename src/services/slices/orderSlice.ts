import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderBurgerApi } from '../../utils/burger-api';
import { TOrder } from '../../utils/types';

export const createOrder = createAsyncThunk(
  'order/create',
  async (ingredientIds: string[]) => {
    const res = await orderBurgerApi(ingredientIds);
    return res.order as unknown as TOrder;
  }
);

interface TOrderState {
  orderRequest: boolean;
  orderModalData: TOrder | null;
  error: string | null;
}

const initialState: TOrderState = {
  orderRequest: false,
  orderModalData: null,
  error: null
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrderData: (state) => {
      state.orderModalData = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.orderRequest = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orderRequest = false;
        state.orderModalData = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.orderRequest = false;
        state.error = action.error.message || 'Ошибка при создании заказа';
      });
  }
});

export const { clearOrderData } = orderSlice.actions;
export default orderSlice.reducer;
