import { useAppDispatch, useAppSelector } from '../store/hooks';
import { resetCheckout } from '../store/checkoutSlice';
import { fetchProducts } from '../store/productsSlice';
import { formatCop } from '../domain/money';
import type { TransactionStatus } from '../api/types';

const STATUS_UI: Record<
  TransactionStatus,
  { icon: string; title: string; tone: string; message: string }
> = {
  APPROVED: {
    icon: '✓',
    title: '¡Pago aprobado!',
    tone: 'approved',
    message: 'Tu compra fue exitosa y tu producto está en camino.',
  },
  DECLINED: {
    icon: '✕',
    title: 'Pago rechazado',
    tone: 'declined',
    message: 'La transacción fue rechazada. Intenta con otra tarjeta.',
  },
  ERROR: {
    icon: '!',
    title: 'Error en el pago',
    tone: 'error',
    message: 'Ocurrió un problema al procesar el pago. Intenta de nuevo.',
  },
  PENDING: {
    icon: '…',
    title: 'Pago pendiente',
    tone: 'pending',
    message: 'Tu pago está siendo verificado.',
  },
};

/** Screen 5: final transaction result + return to catalog with fresh stock. */
export function ResultScreen() {
  const dispatch = useAppDispatch();
  const { transaction, error } = useAppSelector((s) => s.checkout);

  const status: TransactionStatus = transaction?.status ?? 'ERROR';
  const ui = STATUS_UI[status];

  const backToCatalog = () => {
    // Refresh products so the updated stock is reflected in the catalog.
    dispatch(fetchProducts());
    dispatch(resetCheckout());
  };

  return (
    <div className="modal-backdrop">
      <div className={`result result--${ui.tone}`} role="dialog" aria-modal="true">
        <div className={`result__icon result__icon--${ui.tone}`} aria-hidden="true">
          {ui.icon}
        </div>
        <h2>{ui.title}</h2>
        <p>{ui.message}</p>

        {error && status === 'ERROR' && (
          <p className="result__detail" role="alert">
            {error}
          </p>
        )}

        {transaction && (
          <dl className="result__meta">
            <div>
              <dt>Transacción</dt>
              <dd>{transaction.id}</dd>
            </div>
            {transaction.gatewayTransactionId && (
              <div>
                <dt>Referencia pasarela</dt>
                <dd>{transaction.gatewayTransactionId}</dd>
              </div>
            )}
            <div>
              <dt>Total</dt>
              <dd>{formatCop(transaction.totalInCents)}</dd>
            </div>
          </dl>
        )}

        <button className="btn btn--primary" onClick={backToCatalog}>
          Volver a la tienda
        </button>
      </div>
    </div>
  );
}
