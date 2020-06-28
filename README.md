# search-lite

A minimal GraphQL endpoint to a [flexsearch.js](https://github.com/nextapps-de/flexsearch) index.

## Configuration

The configuration is read from `config.json`.
You will find an example configuration in `config.sample.json`.

These are the config options:

- `cors`: CORS config for Apollo Server.
- `searchIndexUrl`: URL to load the flexsearch.js index from on startup.
- `pageSize`: Number of results to return per page.
- `docSchema`: File with the GraphQL schema of the documents stored in the search index.
  See `schema-doc.sample.graphql` for an example.
- `index`: Options with which the flexsearch.js index was created.

## Index creation

Create your flexsearch.js index and write it to a JSON file, for example:

```js
await fs.promises.writeFile("./public/search.json", searchIndex.export())
```

Make this index available under a URL.

## GraphQL endpoint

A standart GraphQL endpoint is provided that you can send post requests against
with the GraphQL in a JSON body like so:

```json
{
    "query": "query { ... }",
    "variables": {
        ...
    }
}
```

The response will also be JSON encoded.

The GraphQL schema of the endpoint looks like this:

```graphql
type Query {
  search(query: String!, page: String): Page!
  document(id: ID!): Document
}

type Page {
  page: String!
  next: String
  result: [Document!]!
}
```

The document type is provided
from the schema definition referenced
in the configuration file.

With `document` individual documents can be queried by ID.
The `search` field performs a search for `query`.
If `page` token is not given,
the first page of results will be returned,
otherwise the given page is returned.
Each page provides the token to the current `page`
and,
if there is a `next` page,
a token to that page.
The `result` fields will contain all documents matching the search query.
