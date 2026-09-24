import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchProducts } from '../store/productsSlice';
import { startCheckout } from '../store/checkoutSlice';
import { formatCop } from '../domain/money';

/** Screen 1: product catalog with description, price and available stock. */
export function ProductCatalog() {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((s) => s.products);

  useEffect(() => {
    if (items.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, items.length]);

  const buy = (productId: string) => {
    dispatch(startCheckout({ productId, quantity: 1 }));
  };

  return (
    <section className="catalog">
      <header className="catalog__header">
        <h1>Tienda Tech</h1>
        <p>Elige tu producto y paga de forma segura</p>
      </header>

      {loading && <p className="catalog__status">Cargando productos…</p>}

      {error && (
        <div className="catalog__status catalog__status--error" role="alert">
          {error}
          <button onClick={() => dispatch(fetchProducts())}>Reintentar</button>
        </div>
      )}

      <div className="catalog__grid">
        {items.map((product) => {
          const outOfStock = product.stock <= 0;
          return (
            <article className="product-card" key={product.id}>
              <div className="product-card__image">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  loading="lazy"
                  width={400}
                  height={300}
                />
              </div>
              <div className="product-card__body">
                <h2>{product.name}</h2>
                <p className="product-card__desc">{product.description}</p>
                <div className="product-card__meta">
                  <span className="product-card__price">
                    {formatCop(product.priceInCents)}
                  </span>
                  <span
                    className={`product-card__stock ${
                      outOfStock ? 'product-card__stock--out' : ''
                    }`}
                  >
                    {outOfStock
                      ? 'Agotado'
                      : `${product.stock} disponibles`}
                  </span>
                </div>
                <button
                  className="btn btn--primary"
                  disabled={outOfStock}
                  onClick={() => buy(product.id)}
                >
                  {outOfStock ? 'Sin stock' : 'Pagar con tarjeta'}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
