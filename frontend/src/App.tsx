import { useAppSelector } from './store/hooks';
import { ProductCatalog } from './screens/ProductCatalog';
import { PaymentModal } from './screens/PaymentModal';
import { SummaryBackdrop } from './screens/SummaryBackdrop';
import { ProcessingScreen } from './screens/ProcessingScreen';
import { ResultScreen } from './screens/ResultScreen';

/**
 * Renders the catalog as the base layer and overlays the current checkout
 * step (form / summary / processing / result) on top of it.
 */
export function App() {
  const step = useAppSelector((s) => s.checkout.step);

  return (
    <div className="app">
      <ProductCatalog />
      {step === 'form' && <PaymentModal />}
      {step === 'summary' && <SummaryBackdrop />}
      {step === 'processing' && <ProcessingScreen />}
      {step === 'result' && <ResultScreen />}
    </div>
  );
}

export default App;
