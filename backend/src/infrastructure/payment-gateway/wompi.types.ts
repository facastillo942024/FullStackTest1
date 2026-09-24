/** Shapes of the relevant Wompi API responses (subset we consume). */

export interface WompiMerchantResponse {
  data: {
    presigned_acceptance: {
      acceptance_token: string;
    };
    presigned_personal_data_auth?: {
      acceptance_token: string;
    };
  };
}

export interface WompiCardTokenResponse {
  status: string;
  data: {
    id: string;
    brand?: string;
    last_four?: string;
  };
}

export type WompiTransactionStatus =
  'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR' | 'PENDING';

export interface WompiTransactionResponse {
  data: {
    id: string;
    status: WompiTransactionStatus;
    status_message?: string | null;
    reference: string;
  };
}
