import ApolloClient from "apollo-client";
// Setup the network "links"
import { WebSocketLink } from 'apollo-link-ws';
import { HttpLink } from 'apollo-link-http';
import { split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';
import { InMemoryCache } from 'apollo-cache-inmemory';
import gql from 'graphql-tag';
import type { OperationDefinitionNode } from "graphql";
import fetch from  'node-fetch'
import ws from 'ws';

const wsUrl = process.env.WS_URL!
const httpUrl = process.env.HTTP_URL!
const { BOT_PASSWORD } = process.env

const wsLink = new WebSocketLink({
  uri: wsUrl,
  options: {
    reconnect: true,
    connectionParams: async () => {
      const token = await getToken();
      return {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    }
  },
  webSocketImpl: ws,
});
const httpLink = new HttpLink({
  uri: httpUrl,
  fetch: fetch,
});

const link = split(
  // split based on operation type
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query) as OperationDefinitionNode
    return kind === 'OperationDefinition' && operation === 'subscription'
  },
  wsLink,
  httpLink,
)

export const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache()
});

export const getToken = async () => {
  try {
    const { data } = await apolloClient.mutate({
      mutation:gql`
        mutation {
          authenticate(
            name:"Fubuki"
            identifier:"3800"
            password:"${BOT_PASSWORD}"
          ){
            token
          }
        }
      `
    })
    
    return data.authenticate.token
  } catch (error) {
    console.log(error)
  }
}