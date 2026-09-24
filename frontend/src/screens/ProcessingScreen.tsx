/** Screen 4: shown while the payment is being processed by the gateway. */
export function ProcessingScreen() {
  return (
    <div className="modal-backdrop">
      <div className="processing" role="status" aria-live="polite">
        <div className="spinner" aria-hidden="true" />
        <h2>Procesando tu pago…</h2>
        <p>Estamos confirmando la transacción con la pasarela. No cierres esta ventana.</p>
      </div>
    </div>
  );
}
