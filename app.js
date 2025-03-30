#!/usr/bin/env node

const { ApolloServer } = require("@apollo/server")
const { startStandaloneServer } = require("@apollo/server/standalone")
const axios = require("axios").default
const { Document } = require("flexsearch")
const fs = require("fs/promises")

const main = async () => {
  const config = JSON.parse(await fs.readFile("config.json"))

  const searchIndex = new Document(config.indexConfig)
  const dataToImport = config.searchIndexUrl
    ? (await axios.get(config.searchIndexUrl, { transformResponse: x => x }))
        .data
    : await fs.readFile(config.searchIndexFile)
  Object.entries(JSON.parse(dataToImport)).map(([key, data]) =>
    searchIndex.import(key, data)
  )

  const typeDefs = `
    type Query {
      search(query: String!, page: String): Page!
      document(id: ID!): Document
    }

    type Page {
      page: String!
      next: String
      result: [Document!]!
    }

    ${await fs.readFile(config.docSchema)}
  `

  const resolvers = {
    Query: {
      search: (_, args) =>
        searchIndex.search(args.query, {
          limit: config.pageSize,
          page: args.page || true,
        }),
      document: (_, args) => searchIndex.find(args.id),
    },
  }

  const server = new ApolloServer({ cors: config.cors, typeDefs, resolvers })
  return await startStandaloneServer(server, {
    listen: { port: 4000 },
  })
}

main().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})
