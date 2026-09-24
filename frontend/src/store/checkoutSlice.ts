import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { checkoutApi } from '../api/checkoutApi';
import { extractApiErrorMessage } from '../api/client';
import type {
  TransactionView,
  CreateTransactionPayload,
  PayPayload,
} from '../api/types';

/**
 * The checkout flow is modeled as a small state machine so the UI can render
 * the correct screen and the progress can be restored from localStorage.
 *
 *  catalog -> form -> summary -> processing -> result
 */
export type CheckoutStep =
  | 'catalog'
  | 'form'
  | 'summary'
  | 'processing'
  | 'result';

export interface CustomerData {
  fullName: string;
  email: string;
  phoneNumber: string;
}

export interface DeliveryData {
  addressLine: string;
  city: string;
  region: string;
  postalCode: string;
}

export interface CardData {
  number: string;
  cvc: string;
  expMonth: string;
  expYear: string;
  cardHolder: string;
}

export interface CheckoutState {
  step: CheckoutStep;
  productId: string | null;
  quantity: number;
  customer: CustomerData;
  delivery: DeliveryData;
  /** Card data is kept only in memory for the current flow, never persisted. */
  card: CardData;
  transaction: TransactionView | null;
  submitting: boolean;
  error: string | null;
}

const emptyCustomer: CustomerData = {
  fullName: '',
  email: '',
  phoneNumber: '',
};

const emptyDelivery: DeliveryData = {
  addressLine: '',
  city: '',
  region: '',
  postalCode: '',
};

const emptyCard: CardData = {
  number: '',
  cvc: '',
  expMonth: '',
  expYear: '',
  cardHolder: '',
};

export const initialState: CheckoutState = {
  step: 'catalog',
  productId: null,
  quantity: 1,
  customer: emptyCustomer,
  delivery: emptyDelivery,
  card: emptyCard,
  transaction: null,
  submitting: false,
  error: null,
};

/** Creates a PENDING transaction on the backend. */
export const createTransaction = createAsyncThunk<
  TransactionView,
  CreateTransactionPayload,
  { rejectValue: string }
>('checkout/createTransaction', async (payload, { rejectWithValue }) => {
  try {
    return await checkoutApi.createTransaction(payload);
  } catch (error) {
    return rejectWithValue(extractApiErrorMessage(error));
  }
});

/** Processes the payment of the current transaction. */
export const payTransaction = createAsyncThunk<
  TransactionView,
  { id: string; payload: PayPayload },
  { rejectValue: string }
>('checkout/payTransaction', async ({ id, payload }, { rejectWithValue }) => {
  try {
    return await checkoutApi.payTransaction(id, payload);
  } catch (error) {
    return rejectWithValue(extractApiErrorMessage(error));
  }
});

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    startCheckout(
      state,
      action: PayloadAction<{ productId: string; quantity: number }>,
    ) {
      state.productId = action.payload.productId;
      state.quantity = action.payload.quantity;
      state.step = 'form';
      state.error = null;
    },
    setQuantity(state, action: PayloadAction<number>) {
      state.quantity = Math.max(1, Math.floor(action.payload));
    },
    setCustomer(state, action: PayloadAction<CustomerData>) {
      state.customer = action.payload;
    },
    setDelivery(state, action: PayloadAction<DeliveryData>) {
      state.delivery = action.payload;
    },
    setCard(state, action: PayloadAction<CardData>) {
      state.card = action.payload;
    },
    goToStep(state, action: PayloadAction<CheckoutStep>) {
      state.step = action.payload;
    },
    /** Resets the flow and returns to the catalog. */
    resetCheckout() {
      return { ...initialState };
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTransaction.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.submitting = false;
        state.transaction = action.payload;
        state.step = 'summary';
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload ?? 'No se pudo crear la transacción';
      })
      .addCase(payTransaction.pending, (state) => {
        state.submitting = true;
        state.error = null;
        state.step = 'processing';
      })
      .addCase(payTransaction.fulfilled, (state, action) => {
        state.submitting = false;
        state.transaction = action.payload;
        state.step = 'result';
        // Card data is discarded once the payment has been processed.
        state.card = emptyCard;
      })
      .addCase(payTransaction.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload ?? 'El pago no pudo procesarse';
        state.step = 'result';
        state.card = emptyCard;
      });
  },
});

export const {
  startCheckout,
  setQuantity,
  setCustomer,
  setDelivery,
  setCard,
  goToStep,
  resetCheckout,
  clearError,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
