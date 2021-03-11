import * as cdk from '@aws-cdk/core'
import * as cognito from '@aws-cdk/aws-cognito'
import * as appsync from '@aws-cdk/aws-appsync'
import * as dynamodb from '@aws-cdk/aws-dynamodb'
import * as s3deployment from '@aws-cdk/aws-s3-deployment'
import * as s3 from '@aws-cdk/aws-s3'
import * as iam from '@aws-cdk/aws-iam'
import * as path from 'path'
import * as fs from 'fs'
import { GraphQLTransform } from 'graphql-transformer-core'
import { DynamoDBModelTransformer } from 'graphql-dynamodb-transformer'
import { ModelConnectionTransformer } from 'graphql-connection-transformer'
import { ModelAuthTransformer } from 'graphql-auth-transformer'

export class MyStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

  // Deployment: only if aws-exports.json is generated

  let deploySite = this.node.tryGetContext('deploySite')
  if (deploySite == 'true') {

    let deploymentBucket = new s3.Bucket(this, 'cdkSiteBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })
  
    let svelteDeployment = new s3deployment.BucketDeployment(this, 'cdkSiteDeployment', {
      sources: [s3deployment.Source.asset(path.join(process.cwd(), 'public'))],
      destinationBucket: deploymentBucket,
      retainOnDelete: false,
    })

    new cdk.CfnOutput(this, 'siteUrl', {
      value: deploymentBucket.bucketWebsiteUrl
    })

  }

  // AUTH: Cognito

    let pmgUserPool = new cognito.UserPool(this, 'cdkUserPool', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      signInAliases: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
        }
      },
      passwordPolicy: {
        requireDigits: false,
        requireLowercase: false,
        requireSymbols: false,
        requireUppercase: false,
      },
      selfSignUpEnabled: true,
      mfa: cognito.Mfa.OFF,
    })

    let webClient = pmgUserPool.addClient('cdkUserPoolWebClient', {
      authFlows: {
        custom: true,
        userSrp: true,
      },
      preventUserExistenceErrors: true,
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
      },
    })
  
    pmgUserPool.addDomain('cdkUserPoolDomain', {
      cognitoDomain: { domainPrefix: this.stackName.toLowerCase() }
    })

    let pmgIdentityPool = new cognito.CfnIdentityPool(this, 'cdkIdentityPool', {
      allowUnauthenticatedIdentities: false,
      cognitoIdentityProviders: [{
        providerName: pmgUserPool.userPoolProviderName,
        clientId: webClient.userPoolClientId,
      }],
    })

    let idPoolRoles:iam.Role[] = ['authenticated', 'unauthenticated'].map(status => {
      return new iam.Role(this, `cdk${status}Role`, {
        assumedBy: new iam.WebIdentityPrincipal('cognito-identity.amazonaws.com', {
          'StringEquals': { 'cognito-identity.amazonaws.com:aud': pmgIdentityPool.ref },
          'ForAnyValue:StringLike': { 'cognito-identity.amazonaws.com:amr': status }
        }),
      })
    })

    new cognito.CfnIdentityPoolRoleAttachment(this, 'cdkIdPoolAttachRoles', {
      identityPoolId: pmgIdentityPool.ref,
      roles: {
        authenticated: idPoolRoles[0].roleArn,
        unauthenticated: idPoolRoles[1].roleArn,
      }
    })

  // Schema & VTL Generation

    let baseGqlSchema = fs.readFileSync(path.join(process.cwd(), 'graphql', 'base-schema.graphql')).toString()
    let generatedSchemaPath = path.join(process.cwd(), 'graphql', 'schema.graphql')
    let generatedResolversDir = path.join(process.cwd(), 'graphql', 'generated-resolvers')

    let transformer = new GraphQLTransform({
      transformers: [
        new DynamoDBModelTransformer(),
        new ModelConnectionTransformer(),
        new ModelAuthTransformer({
          authConfig: {
            defaultAuthentication: {
              authenticationType: 'AMAZON_COGNITO_USER_POOLS'
            },
            additionalAuthenticationProviders: [],
          }
        }),
      ]
    })
    
    let gqlCodeGen = transformer.transform(baseGqlSchema)
    fs.writeFileSync(generatedSchemaPath, gqlCodeGen.schema)
    Object.keys(gqlCodeGen.resolvers).map(key => {
      if (!fs.existsSync(generatedResolversDir)) {
        fs.mkdirSync(generatedResolversDir)
      }
      let vtl = gqlCodeGen.resolvers[key]
      fs.writeFileSync(path.resolve(generatedResolversDir, key), vtl);
    })

  // API: AppSync, DynamoDB

    let gqlApi = new appsync.GraphqlApi(this, 'cdkGqlApi', {
      name: `${this.stackName}API`,
      schema: appsync.Schema.fromAsset(generatedSchemaPath),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool: pmgUserPool,
          },
        }
      }
    })

  // API: DynamoDB Connectivity to AppSync

    let ddbTable = new dynamodb.Table(this, 'cdkMetadataTable', {
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    })

    let appsyncDdbConnection = gqlApi.addDynamoDbDataSource('appsyncToDDB', ddbTable)

    let resolversPath = generatedResolversDir
    fs.readdir(resolversPath, (err, resolvers) => {
      resolvers.map(resolverName => {
        let [typeName, fieldName, resolverType, fileExt] = resolverName.split('.')
        if (resolverType == 'req') {
          appsyncDdbConnection.createResolver({
            typeName,
            fieldName,
            requestMappingTemplate: appsync.MappingTemplate.fromFile(path.join(resolversPath, `${typeName}.${fieldName}.req.vtl`)),
            responseMappingTemplate: appsync.MappingTemplate.fromFile(path.join(resolversPath, `${typeName}.${fieldName}.res.vtl`))
          })
        }
      })
    })

  // Amplify Config

    new cdk.CfnOutput(this, 'amplifyConfig', {
      value: JSON.stringify({
          "aws_project_region": this.region,
          'aws_cognito_identity_pool_id': pmgIdentityPool.ref,
          'aws_cognito_region': this.region,
          'aws_user_pools_id': pmgUserPool.userPoolId,
          'aws_user_pools_web_client_id': webClient.userPoolClientId,
          "federationTarget": "COGNITO_USER_POOLS",
          'aws_appsync_graphqlEndpoint': gqlApi.graphqlUrl,
          'aws_appsync_region': this.region,
          'aws_appsync_authenticationType': 'AMAZON_COGNITO_USER_POOLS',
      })
    })
  
  }
}
