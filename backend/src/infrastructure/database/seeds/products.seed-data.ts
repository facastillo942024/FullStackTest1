export interface SeedProduct {
  id: string;
  name: string;
  description: string;
  priceInCents: number;
  stock: number;
  imageUrl: string;
}

/**
 * Deterministic dummy catalog. Fixed UUIDs make the frontend/dev experience
 * reproducible across re-seeds.
 */
export const SEED_PRODUCTS: SeedProduct[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Auriculares Inalámbricos Pro',
    description:
      'Auriculares over-ear con cancelación activa de ruido, 30h de batería y carga rápida USB-C.',
    priceInCents: 34990000,
    stock: 25,
    imageUrl:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    name: 'Teclado Mecánico RGB',
    description:
      'Teclado mecánico switches rojos, retroiluminación RGB personalizable y estructura de aluminio.',
    priceInCents: 24990000,
    stock: 40,
    imageUrl:
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    name: 'Mouse Ergonómico Inalámbrico',
    description:
      'Mouse ergonómico de precisión 16000 DPI, conexión 2.4G y Bluetooth, batería recargable.',
    priceInCents: 15990000,
    stock: 60,
    imageUrl:
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
  },
];
