const { ApolloServer, gql } = require("apollo-server")
const axios = require("axios").default
const FlexSearch = require("flexsearch")
const fs = require("fs")

const main = async () => {
  const config = JSON.parse(await fs.promises.readFile("config.json"))

  const searchIndex = new FlexSearch(config.indexConfig)
  searchIndex.import(
    (await axios.get(config.searchIndexUrl, { transformResponse: x => x })).data
  )

  const typeDefs = gql`
    type Query {
      search(query: String!, page: String): Page!
      document(id: ID!): Document
    }

    type Page {
      page: String!
      next: String
      result: [Document!]!
    }

    ${await fs.promises.readFile(config.docSchema)}
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
  return await server.listen()
}

main().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})
