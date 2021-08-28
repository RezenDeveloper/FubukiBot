import ApolloClient from 'apollo-client'
import { WebSocketLink } from 'apollo-link-ws'
import { HttpLink } from 'apollo-link-http'
import { split } from 'apollo-link'
import { getMainDefinition } from 'apollo-utilities'
import { InMemoryCache } from 'apollo-cache-inmemory'
import type { OperationDefinitionNode } from 'graphql'
import fetch from 'node-fetch'
import ws from 'ws'

const wsUrl = process.env.WS_URL!
const httpUrl = process.env.HTTP_URL!
const token = process.env.TOKEN!

const wsLink = new WebSocketLink({
  uri: wsUrl,
  options: {
    reconnect: true,
    connectionParams: {
      authorization: `Bot ${token}`,
    },
  },
  webSocketImpl: ws,
})
const httpLink = new HttpLink({
  uri: httpUrl,
  fetch: fetch,
  headers: {
    authorization: `Bot ${token}`,
  },
})

const link = split(
  // split based on operation type
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query) as OperationDefinitionNode
    return kind === 'OperationDefinition' && operation === 'subscription'
  },
  wsLink,
  httpLink
)

export const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
})
