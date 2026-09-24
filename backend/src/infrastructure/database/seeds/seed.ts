import { AppDataSource } from '../data-source';
import { ProductOrmEntity } from '../entities/product.orm-entity';
import { SEED_PRODUCTS } from './products.seed-data';

/**
 * Idempotent seeder: inserts the dummy catalog if the products do not already
 * exist. Safe to run multiple times.
 */
async function run(): Promise<void> {
  const dataSource = await AppDataSource.initialize();
  try {
    const repo = dataSource.getRepository(ProductOrmEntity);

    for (const product of SEED_PRODUCTS) {
      const existing = await repo.findOne({ where: { id: product.id } });
      if (existing) {
        // eslint-disable-next-line no-console
        console.log(`- Skipping existing product: ${product.name}`);
        continue;
      }
      const entity = repo.create({
        id: product.id,
        name: product.name,
        description: product.description,
        priceInCents: product.priceInCents,
        stock: product.stock,
        imageUrl: product.imageUrl,
      });
      await repo.save(entity);
      // eslint-disable-next-line no-console
      console.log(`+ Inserted product: ${product.name}`);
    }

    // eslint-disable-next-line no-console
    console.log('Seed completed.');
  } finally {
    await dataSource.destroy();
  }
}

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', error);
  process.exit(1);
});
