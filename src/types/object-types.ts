import * as appsync from '@aws-cdk/aws-appsync';
import * as scalar from './scalar-types';

export const Product = new appsync.ObjectType('Product', {
  definition: {
    id: scalar.id,
    title: scalar.string,
    totalPrice: scalar.int,
  },
});

export const CreateProductPayload = new appsync.ObjectType('CreateProductPayload', {
  definition: {
    product: Product.attribute(),
    successful: scalar.required_boolean,
  },
});