<h1 align="center">
  <br>
  <a href="https://github.com/CotomanAnatoli/Workshop_Type_Safety_GraphQL_CLIENT"><img src="https://paljs.com/header.png" alt="GraphQL" width="600">
  </a>
  <br>
  End-To-End Type Safety with React, GraphQL & Prisma
  <br>
</h1>

### Resources
- [The Notion Document](https://github.com/CotomanAnatoli/Workshop_Type_Safety_GraphQL_CLIENT/blob/main/README.md)
- [GitHub starter project](https://github.com/CotomanAnatoli/Workshop_Type_Safety_GraphQL_CLIENT)

### Prerequisites
In order to successfully complete the tasks in the workshop, you should have:
- Node.js installed on your machine (12.2.X / 14.X)
- An IDE installed (VSCode or WebStorm)
- (Good to have)*A basic understanding of Node.js, React, and TypeScript

<h1 align="center">1. Front-End: GraphQL on the Client</h1>

### Goal
The goal of this lesson is to put your GraphQL server to use by hooking the client-side application up to it.
A GraphQL request will be made for your `User` and`Note` data, which takes care of yet another area of type-safety: the network request. GraphQL allows you to be sure the data you retrive actually exists and is exposed.

### Setup
First, clone the [starter project from GitHub](https://github.com/CotomanAnatoli/Workshop_Type_Safety_GraphQL_CLIENT) on your machine.


### Task 1: Install dependencies
Install dependencies for the project. Run this command:
```shell
npm i
```

### Task 2: Provide the  Apollo Client to your application
To use Apollo Client in your application, you will need to initialize its client using its `ApolloClient` and provide that to your application using its `ApolloProvider` component.

Initialize the client in `main.tsx` and wrap the `<App/>` component in the provider.

For help, checkout Apollo's [docs](https://www.apollographql.com/docs/react/get-started).

<details><summary><b>Solution</b></summary>

Install dependencies:
```shell
npm install @apollo/client graphql
```

```typescript
// src/main.tsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'
import App from './App'
import './index.css'

const client = new ApolloClient({
    uri: 'http://localhost:4000/graphql',
    cache: new InMemoryCache()
})


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <ApolloProvider client={client}>
          <App />
      </ApolloProvider>
  </React.StrictMode>
)
```
</details>

### Task 3: Write a GraphQL query for user data
In this application, you will need a user's `name`, `id` and all of their notes. For each note, you only need to select the `id`, `message` and `createdAt` fields.

You will keep your GraphQL queries organized in a separate `graphql` folder. Create a folder in `src` named `graphql`. Then create a file named `users.query.ts` and write your query in that file using the `gql` helper Apollo provides. Export the query.

If you aren't familiar with GraphQL syntax, check out this [resource](https://www.apollographql.com/docs/react/data/queries).

<details><summary><b>Solution</b></summary>

```typescript
// src/graphql/users.query.ts

import {gql} from '@apollo/client'

export const GET_USERS = gql(`
    query GetUsers() {
        users {
            id 
            name 
            notes {
                id createdAt message
            }
        }
    }
`)
```
</details>

### Task 4: Run your query and render the user
Now put that query to use. Use the `useQuery` hook from Apollo to run that query and access the data. Replace the existing `data` variable with the results of taht query.

Check [here](https://www.apollographql.com/docs/react/data/queries) for documentation on the `useQuery` hook.

<details><summary><b>Solution</b></summary>

```typescript
// src/App.tsx

function App() {
    const { data } = useQuery<Record<'users', User[]>>(GET_USERS);

    return (
        <div className="bg-white flex-col h-screen w-full flex items-center p-4 gap-y-12 overflow-scroll">
            {
                data?.users.map((user) => <UserDisplay user={user} key={user.id} />)
}
    </div>
)
}
```
</details>

### Task 5: Break it!
This is great! Your application is grabbing data from the GraphQL API everything looks good. But things could be better.

In your GraphQL query, remove the `createdAt` field from the query. Notice that even though the field was removed from your query, the type definition for a `Note` still includes that field, and as result, your UI shows some unexpected results.

<h1 align="center">2. Front-End: Bridge the gap</h1>

### Goal
The goal of this lesson is to put code generation in place to validate your GraphQL queries and generate types representing the query objects and responses. This will fix the final gap keeping you from true end-to-end type safety.

### Task 1: Install the codegen libraries
In order to overcome the issue of out-sync types on the front-end application, you will make use of code-generation using a library called `graphql-codegen`. This library will scan through the queries in your application, verify they are valid by comparing them to your GraphQL schema, and then generate types taht accurately represents the fields fetched.

You will need to install that library along with these plugins the accomplish this:
- `@graphql-codegen/cli` (The CLI tool that allows you to use different plugins to generate assets from a GraphQL API.)
- `@graphql-codegen/typescript-operations` (The GraphQL Codegen plugin that generates TypeScript types representing queries and responses based on queries you've written.)
- `@graphql-codegen/typescript` (The base plugin for GraphQL Codegen TypeScript-based plugins. This plugin takes your GraphQL API's schema and generates TypeScript types for each GraphQL type.)
- `@graphql-codegen/typed-document-node` (The GraphQL Codegen plugin that generates an Abstract Syntax Tree (AST) representation of any queries you've written.)

<details><summary><b>Solution</b></summary>

```shell
npm install -D @graphql-codegen/cli @graphql-codegen/typescript-operations @graphql-codegen/typescript @graphql-codegen/typed-document-node
```
</details>

### Task 2: Configure `graphql-codegen`
You now need to configure `graphql-codegen` so that it knows where to look for GraphQL files, where to output the generated types, and which pluging to use.

Configure the library to:
- Use `http://localhost:4000/graphql` to find the GraphQL schema
- Search for any GraphQL queries in `.ts` files within your `graphql` folder
- Output the types into `./src/graphql/generated.ts`
- Use all three plugins you installed

For information on how to configure `graphql-codegen`, check out the [docs](https://the-guild.dev/graphql/codegen/docs/config-reference/codegen-config).

<details><summary><b>Solution</b></summary>

Add `codegen.yml` file into the root folder:

```yaml
// codegen.yml

schema: http://localhost:4000/graphql
documents: "./src/graphql/*.ts"
generates:
  ./src/graphql/generated.ts:
    plugins:
      - typescript
      - typescript-operations
      - typed-document-node
```

</details>

### Task 3: Add a "codegen" script to `package.json`
The library is now configured, go ahead and add a script called `codegen` to `package.json` that runs the code generator, then run script to generate the types.

If you aren't sure what needs to be added, check out the doc's [development workflow suggestions](https://the-guild.dev/graphql/codegen/docs/getting-started/development-workflow).

<details><summary><b>Solution</b></summary>

```json
"scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "codegen": "graphql-codegen"
  },
```
</details>

### Task 4: Replace queries with generated query objects
You can get rid of the `User` type import and the `GetUsers` query import and instead import the query object named `GetUsersDocument` generated by `graphql-codegen`

The `results` variable should be automatically typed now based on the actual query you run!

<details><summary><b>Solution</b></summary>
  
```typescript
// src/App.tsx

import UserDisplay from './components/UserDisplay'
import { useQuery } from '@apollo/client'
import { GetUsersDocument } from './graphql/generated'

function App() {
  const { data } = useQuery(GetUsersDocument);

  return (
    <div className="bg-white flex-col h-screen w-full flex items-center p-4 gap-y-12 overflow-scroll">
      {
        data?.users.map((user) => <UserDisplay user={user} key={user.id} />)
      }
    </div>
  )
}

export default App  
```  
</details>  

### Task 5: Adjust types
You will now see some types errors because of the missing `createdAt` field. That's exactly what we wanted!

In `types.ts`, adjust the exported types to use the types generated that represent the result of the `GetUsers` query.

<details><summary><b>Solution</b></summary>

```typescript
// src/types.ts

import {GetUsersQuery} from './graphql/generated'

export type Note = GetUsersQuery['users'][0]['notes'][0]

export type User = GetUsersQuery['users'][0]
```
</details>
