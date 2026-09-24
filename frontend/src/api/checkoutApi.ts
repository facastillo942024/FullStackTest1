import { apiClient } from './client';
import type {
  Product,
  TransactionView,
  CreateTransactionPayload,
  PayPayload,
} from './types';

export const checkoutApi = {
  async getProducts(): Promise<Product[]> {
    const { data } = await apiClient.get<Product[]>('/products');
    return data;
  },

  async getProduct(id: string): Promise<Product> {
    const { data } = await apiClient.get<Product>(`/products/${id}`);
    return data;
  },

  async createTransaction(
    payload: CreateTransactionPayload,
  ): Promise<TransactionView> {
    const { data } = await apiClient.post<TransactionView>(
      '/transactions',
      payload,
    );
    return data;
  },

  async payTransaction(
    id: string,
    payload: PayPayload,
  ): Promise<TransactionView> {
    const { data } = await apiClient.post<TransactionView>(
      `/transactions/${id}/pay`,
      payload,
    );
    return data;
  },

  async getTransaction(id: string): Promise<TransactionView> {
    const { data } = await apiClient.get<TransactionView>(
      `/transactions/${id}`,
    );
    return data;
  },
};
