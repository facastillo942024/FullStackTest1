import { useAppDispatch, useAppSelector } from '../store/hooks';
import { payTransaction, goToStep } from '../store/checkoutSlice';
import { formatCop } from '../domain/money';
import { detectBrand } from '../domain/cardValidation';
import { CardBrandLogo } from '../components/CardBrandLogo';

/** Screen 3: payment summary backdrop with the fee breakdown + pay button. */
export function SummaryBackdrop() {
  const dispatch = useAppDispatch();
  const { transaction, card, submitting, error } = useAppSelector(
    (s) => s.checkout,
  );
  const product = useAppSelector((s) =>
    s.products.items.find((p) => p.id === transaction?.productId),
  );

  if (!transaction) {
    return null;
  }

  const brand = detectBrand(card.number);
  const lastFour = card.number.slice(-4);

  const pay = () => {
    dispatch(
      payTransaction({
        id: transaction.id,
        payload: { card },
      }),
    );
  };

  return (
    <div className="modal-backdrop">
      <div className="summary" role="dialog" aria-modal="true">
        <header className="summary__header">
          <h2>Resumen de tu compra</h2>
        </header>

        {product && (
          <div className="summary__product">
            <img src={product.imageUrl} alt={product.name} width={64} height={64} />
            <div>
              <strong>{product.name}</strong>
              <span>Cantidad: {transaction.quantity}</span>
            </div>
          </div>
        )}

        <dl className="summary__breakdown">
          <div>
            <dt>Valor del producto</dt>
            <dd>{formatCop(transaction.amountInCents)}</dd>
          </div>
          <div>
            <dt>Tarifa base</dt>
            <dd>{formatCop(transaction.baseFeeInCents)}</dd>
          </div>
          <div>
            <dt>Costo de envío</dt>
            <dd>{formatCop(transaction.deliveryFeeInCents)}</dd>
          </div>
          <div className="summary__total">
            <dt>Total a pagar</dt>
            <dd>{formatCop(transaction.totalInCents)}</dd>
          </div>
        </dl>

        <div className="summary__card">
          <CardBrandLogo brand={brand} />
          <span>•••• •••• •••• {lastFour || '····'}</span>
        </div>

        {error && (
          <p className="modal__error" role="alert">
            {error}
          </p>
        )}

        <div className="summary__actions">
          <button
            className="btn btn--ghost"
            onClick={() => dispatch(goToStep('form'))}
            disabled={submitting}
          >
            Volver
          </button>
          <button
            className="btn btn--primary"
            onClick={pay}
            disabled={submitting}
          >
            {submitting ? 'Procesando…' : `Pagar ${formatCop(transaction.totalInCents)}`}
          </button>
        </div>
      </div>
    </div>
  );
}
