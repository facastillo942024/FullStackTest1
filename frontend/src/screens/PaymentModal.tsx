import { useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  setCard,
  setCustomer,
  setDelivery,
  setQuantity,
  createTransaction,
  resetCheckout,
} from '../store/checkoutSlice';
import { Field } from '../components/Field';
import { CardBrandLogo } from '../components/CardBrandLogo';
import {
  detectBrand,
  formatCardNumber,
  sanitizeCardNumber,
  validateCard,
  type CardFieldErrors,
} from '../domain/cardValidation';
import {
  validateCustomer,
  validateDelivery,
  type FieldErrors,
  type CustomerFormValues,
  type DeliveryFormValues,
} from '../domain/deliveryValidation';
import { formatCop } from '../domain/money';

/** Screen 2: modal capturing card + delivery data, then creates the tx. */
export function PaymentModal() {
  const dispatch = useAppDispatch();
  const { productId, quantity, card, customer, delivery, submitting, error } =
    useAppSelector((s) => s.checkout);
  const product = useAppSelector((s) =>
    s.products.items.find((p) => p.id === productId),
  );

  const [cardForm, setCardForm] = useState(card);
  const [customerForm, setCustomerForm] = useState(customer);
  const [deliveryForm, setDeliveryForm] = useState(delivery);
  const [cardErrors, setCardErrors] = useState<CardFieldErrors>({});
  const [customerErrors, setCustomerErrors] = useState<
    FieldErrors<CustomerFormValues>
  >({});
  const [deliveryErrors, setDeliveryErrors] = useState<
    FieldErrors<DeliveryFormValues>
  >({});

  const brand = useMemo(
    () => detectBrand(cardForm.number),
    [cardForm.number],
  );

  if (!product) {
    return (
      <div className="modal-backdrop">
        <div className="modal">
          <p>Producto no disponible.</p>
          <button className="btn" onClick={() => dispatch(resetCheckout())}>
            Volver
          </button>
        </div>
      </div>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const cErr = validateCard(cardForm);
    const custErr = validateCustomer(customerForm);
    const delErr = validateDelivery(deliveryForm);
    setCardErrors(cErr);
    setCustomerErrors(custErr);
    setDeliveryErrors(delErr);

    const hasErrors =
      Object.keys(cErr).length > 0 ||
      Object.keys(custErr).length > 0 ||
      Object.keys(delErr).length > 0;
    if (hasErrors) return;

    // Persist form data into the store (card stays in-memory only).
    dispatch(setCard(cardForm));
    dispatch(setCustomer(customerForm));
    dispatch(setDelivery(deliveryForm));

    dispatch(
      createTransaction({
        productId: product.id,
        quantity,
        customer: customerForm,
        delivery: deliveryForm,
      }),
    );
  };

  return (
    <div className="modal-backdrop">
      <div className="modal" role="dialog" aria-modal="true">
        <header className="modal__header">
          <h2>Datos de pago y envío</h2>
          <button
            className="modal__close"
            aria-label="Cerrar"
            onClick={() => dispatch(resetCheckout())}
          >
            ×
          </button>
        </header>

        <form className="modal__body" onSubmit={submit} noValidate>
          <fieldset>
            <legend>Tarjeta de crédito</legend>
            <Field
              name="number"
              label="Número de tarjeta"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="4242 4242 4242 4242"
              value={formatCardNumber(cardForm.number)}
              error={cardErrors.number}
              rightSlot={<CardBrandLogo brand={brand} />}
              onChange={(e) =>
                setCardForm({
                  ...cardForm,
                  number: sanitizeCardNumber(e.target.value),
                })
              }
            />
            <div className="field-row">
              <Field
                name="expMonth"
                label="Mes (MM)"
                inputMode="numeric"
                placeholder="08"
                maxLength={2}
                value={cardForm.expMonth}
                error={cardErrors.expMonth}
                onChange={(e) =>
                  setCardForm({ ...cardForm, expMonth: e.target.value })
                }
              />
              <Field
                name="expYear"
                label="Año (YY)"
                inputMode="numeric"
                placeholder="30"
                maxLength={2}
                value={cardForm.expYear}
                error={cardErrors.expYear}
                onChange={(e) =>
                  setCardForm({ ...cardForm, expYear: e.target.value })
                }
              />
              <Field
                name="cvc"
                label="CVC"
                inputMode="numeric"
                placeholder="123"
                maxLength={4}
                value={cardForm.cvc}
                error={cardErrors.cvc}
                onChange={(e) =>
                  setCardForm({ ...cardForm, cvc: e.target.value })
                }
              />
            </div>
            <Field
              name="cardHolder"
              label="Titular de la tarjeta"
              autoComplete="cc-name"
              placeholder="JUAN PEREZ"
              value={cardForm.cardHolder}
              error={cardErrors.cardHolder}
              onChange={(e) =>
                setCardForm({ ...cardForm, cardHolder: e.target.value })
              }
            />
          </fieldset>

          <fieldset>
            <legend>Datos del cliente</legend>
            <Field
              name="fullName"
              label="Nombre completo"
              value={customerForm.fullName}
              error={customerErrors.fullName}
              onChange={(e) =>
                setCustomerForm({ ...customerForm, fullName: e.target.value })
              }
            />
            <Field
              name="email"
              label="Correo electrónico"
              type="email"
              value={customerForm.email}
              error={customerErrors.email}
              onChange={(e) =>
                setCustomerForm({ ...customerForm, email: e.target.value })
              }
            />
            <Field
              name="phoneNumber"
              label="Teléfono"
              inputMode="tel"
              value={customerForm.phoneNumber}
              error={customerErrors.phoneNumber}
              onChange={(e) =>
                setCustomerForm({
                  ...customerForm,
                  phoneNumber: e.target.value,
                })
              }
            />
          </fieldset>

          <fieldset>
            <legend>Dirección de entrega</legend>
            <Field
              name="addressLine"
              label="Dirección"
              value={deliveryForm.addressLine}
              error={deliveryErrors.addressLine}
              onChange={(e) =>
                setDeliveryForm({
                  ...deliveryForm,
                  addressLine: e.target.value,
                })
              }
            />
            <div className="field-row">
              <Field
                name="city"
                label="Ciudad"
                value={deliveryForm.city}
                error={deliveryErrors.city}
                onChange={(e) =>
                  setDeliveryForm({ ...deliveryForm, city: e.target.value })
                }
              />
              <Field
                name="region"
                label="Departamento"
                value={deliveryForm.region}
                error={deliveryErrors.region}
                onChange={(e) =>
                  setDeliveryForm({ ...deliveryForm, region: e.target.value })
                }
              />
            </div>
            <Field
              name="postalCode"
              label="Código postal"
              inputMode="numeric"
              value={deliveryForm.postalCode}
              error={deliveryErrors.postalCode}
              onChange={(e) =>
                setDeliveryForm({
                  ...deliveryForm,
                  postalCode: e.target.value,
                })
              }
            />
          </fieldset>

          <div className="field quantity-field">
            <label htmlFor="quantity">Cantidad</label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min={1}
              max={product.stock}
              value={quantity}
              onChange={(e) => dispatch(setQuantity(Number(e.target.value)))}
            />
          </div>

          {error && (
            <p className="modal__error" role="alert">
              {error}
            </p>
          )}

          <div className="modal__footer">
            <span className="modal__total">
              Subtotal: {formatCop(product.priceInCents * quantity)}
            </span>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={submitting}
            >
              {submitting ? 'Procesando…' : 'Continuar al resumen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
