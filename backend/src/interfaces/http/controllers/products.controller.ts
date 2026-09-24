import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetProductsUseCase } from '../../../application/use-cases/get-products.use-case';
import { GetProductByIdUseCase } from '../../../application/use-cases/get-product-by-id.use-case';
import { toProductView, ProductView } from '../presenters/product.presenter';
import { DomainHttpException } from '../filters/domain-exception.filter';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly getProducts: GetProductsUseCase,
    private readonly getProductById: GetProductByIdUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all products with available stock' })
  @ApiResponse({ status: 200, description: 'List of products' })
  async findAll(): Promise<ProductView[]> {
    const result = await this.getProducts.execute();
    if (result.isErr) {
      throw new DomainHttpException(result.error);
    }
    return result.value.map(toProductView);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single product by id' })
  @ApiResponse({ status: 200, description: 'The product' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id') id: string): Promise<ProductView> {
    const result = await this.getProductById.execute(id);
    if (result.isErr) {
      throw new DomainHttpException(result.error);
    }
    return toProductView(result.value);
  }
}
