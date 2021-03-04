import * as appsync from '@aws-cdk/aws-appsync';
import * as scalar from './scalar-types';

export const CreateProductInput = new appsync.InputType('CreateProductInput', {
  definition: {
    title: scalar.required_string,
    totalPrice: scalar.int,
  },
});