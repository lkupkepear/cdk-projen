import { join } from 'path';
import { Schema, ObjectType, GraphqlApi, AuthorizationType, ResolvableField, IntermediateTypeOptions } from '@aws-cdk/aws-appsync';
import { Table, AttributeType, BillingMode } from '@aws-cdk/aws-dynamodb';
import { Code, Function, Runtime } from '@aws-cdk/aws-lambda';
import { App, Construct, Stack, StackProps, Expiration, Duration, CfnOutput } from '@aws-cdk/core';

// import * as schema from './types/object-types';
import * as scalar from './types/scalar-types';
import * as schema from './types';

export class MyStack extends Stack {
  objectTypes: IntermediateTypeOptions[];
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    const api = new GraphqlApi(this, 'GraphQL API', {
      name: 'demo',
      // schema: Schema.fromAsset(join(__dirname, 'products/schema.graphql')),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: Expiration.after(Duration.days(365)),
          },
        },
      },
      xrayEnabled: true,
    });

    const productTable = new Table(this, 'ProductTable', {
      billingMode: BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
    });

    const productLambda = new Function(this, 'AppSyncProductHandler', {
      runtime: Runtime.NODEJS_12_X,
      handler: 'main.handler',
      code: Code.fromAsset(join(__dirname, 'product', 'lambdas')),
      memorySize: 1024,
    });

    const productLambdaDS = api.addLambdaDataSource('lambdaDatasource', productLambda);

    this.objectTypes = [schema.Product, schema.CreateProductPayload, schema.CreateProductInput];

    api.addQuery('product', new ResolvableField({
      returnType: schema.Product.attribute(),
      args: {
        id: scalar.required_id,
      },
      dataSource: productLambdaDS,
    }));

    api.addQuery('product', new ResolvableField({
      returnType: schema.Product.attribute(),
      args: {
        title: scalar.required_string,
      },
      dataSource: productLambdaDS,
    }));

    api.addMutation('createProduct', new ResolvableField({
      returnType: schema.CreateProductPayload.attribute(),
      args: {
        input: schema.CreateProductInput.attribute(),
      },
      dataSource: productLambdaDS,
    }));

    new CfnOutput(this, 'GraphQLAPIURL', {
      value: api.graphqlUrl,
    });

    new CfnOutput(this, 'GraphQLAPIKey', {
      value: api.apiKey || '',
    });

    new CfnOutput(this, 'Stack Region', {
      value: this.region,
    });
    // define resources here...
  }
}

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new MyStack(app, 'my-stack-dev', { env: devEnv });
// new MyStack(app, 'my-stack-prod', { env: prodEnv });

app.synth();