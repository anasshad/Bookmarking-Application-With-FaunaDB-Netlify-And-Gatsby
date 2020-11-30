const { ApolloServer, gql } = require("apollo-server-lambda")
const axios = require("axios")
const cheerio = require("cheerio")

async function getDetails(url) {
  const { data } = await axios.get(url)
  const $ = cheerio.load(data)

  return {
    title: $("head > title").text(),
    description: $('meta[name="description"]').attr("content"),
  }
}

const faunadb = require("faunadb")
const q = faunadb.query

const typeDefs = gql`
  type Query {
    hello: String
    links: [Link!]
  }
  type Mutation {
    addLink(url: String!): Link
  }
  type Link {
    id: ID!
    url: String!
    pageTitle: String!
    description: String!
  }
`

const resolvers = {
  Query: {
    hello: () => {
      return "Hello, world!"
    },
    links: async (root, args, context) => {
      try {
        const adminClient = new faunadb.Client({
          secret: "fnAD70B6RYACB1kWQ4mic9CSNXzMjXE9wEkfKOwr",
        })
        const result = await adminClient.query(
          q.Map(
            q.Paginate(q.Match(q.Index("all_links"))),
            q.Lambda(x => q.Get(x))
          )
        )
        console.log("Result: ", result)
        return result.data.map(d => ({
          id: d.ts,
          url: d.data.url,
          pageTitle: d.data.pageTitle,
          description: d.data.description,
        }))
      } catch (error) {
        console.log(error)
      }
    },
  },
  Mutation: {
    addLink: async (_, { url }) => {
      const { title, description } = await getDetails(url)
      const adminClient = new faunadb.Client({
        secret: "fnAD70B6RYACB1kWQ4mic9CSNXzMjXE9wEkfKOwr",
      })
      const result = await adminClient.query(
        q.Create(q.Collection("Links"), {
          data: {
            url,
            pageTitle: title,
            description,
          },
        })
      )
      return result.ref.data
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
})

const handler = server.createHandler()

module.exports = { handler }
