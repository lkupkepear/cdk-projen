import { GraphqlType } from '@aws-cdk/aws-appsync';

export const string = GraphqlType.string();
export const int = GraphqlType.int();
export const id = GraphqlType.id();
export const boolean = GraphqlType.boolean({ isRequired: true });

export const required_string = GraphqlType.string({ isRequired: true });
export const required_int = GraphqlType.int({ isRequired: true});
export const required_id = GraphqlType.id({ isRequired: true });
export const required_boolean = GraphqlType.boolean({ isRequired: true });
