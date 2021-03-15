/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getToDo = /* GraphQL */ `
  query GetToDo($id: ID!) {
    getToDo(id: $id) {
      id
      name
      creator
      comments
      sampleJson
      createdAt
      updatedAt
    }
  }
`;
export const listToDos = /* GraphQL */ `
  query ListToDos(
    $filter: ModelToDoFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listToDos(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        creator
        comments
        sampleJson
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
