# <b>Full Stack Template</b>: Svelte, Amplify, CDK

## Set Up
1. Install the following if they aren't already: node v15,
    ```bash
    npm install -g @aws-amplify/cli aws-cdk typescript
    ```
2. Clone this repo and run:
    ```bash
    npm install
    ```
3. Create a GraphQL schema (https://docs.amplify.aws/cli/graphql-transformer/overview) and save it as `graphql/base-schema.graphql`.
4. Generate AppSync schema and resolvers:
    ```bash
    npm run cdk.diff
    ```
5. Generate GraphQL statements for client use:
    ```bash
    npm run codegen
    ```
6. Develop Svelte app:
    ```bash
    npm run dev
    ```
7. Deploy Svelte app and CDK:
    ```bash
    npm run full.deploy
    ```

## Folder Structure

```
│   README.md
│   .gitignore
│   package.json
│   tsconfig.json
│   cdk.json
│   aws-exports.json 
│   rollup.config.js
│   
├───cdk
│       cdk.ts
│       *.stack.ts
│       
├───graphql
│   │   .graphqlconfig.yml
│   │   base-schema.graphql
│   │   schema.graphql
│   │   
│   ├───generated-resolvers
│   │       *.req.vtl  
│   │       *.res.vtl  
│   │       
│   └───statements
│           mutations.js        
│           queries.js
│           subscriptions.js    
│
├───public
│       index.html
│       logo.png
│       
└───src
        index.ts
        store.ts
        App.svelte
        Header.svelte
        Login.svelte
        Theme.svelte
```

## Custom Changes

* `tsconfig.json` taken from Svelte template, with some CDK includes and excludes added.
* `rollup.config.js` taken from Svelte Rollup template with the addition of `rollup-plugin-visualizer`.
* `package.json`:
    * Moved most dependencies into devDependencies since they're only needed for development.
    * Created `codegen` and frequently used `cdk.*` scripts. 
        * `full.deploy` will deploy Amplify backend, then build site, before deploying site onto S3.
        * `codegen` requires `@aws-amplify/cli`.
* `cdk.json` taken from CDK standard template, but changed entry point to `cdk/cdk.ts` for simplicity.
