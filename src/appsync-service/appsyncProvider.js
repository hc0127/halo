import React from 'react'
import {
  ApolloProvider,
  ApolloClient,
  ApolloLink,
  InMemoryCache,
} from '@apollo/client'

import { createAuthLink } from 'aws-appsync-auth-link'
import { createSubscriptionHandshakeLink } from 'aws-appsync-subscription-link'
import { createHttpLink } from 'apollo-link-http'

import awsConfig from './aws-exports'

const url = awsConfig.aws_appsync_graphqlEndpoint
const region = awsConfig.aws_appsync_region
const auth = {
  type: awsConfig.aws_appsync_authenticationType,
  apiKey: awsConfig.aws_appsync_apiKey,
}

const link = ApolloLink.from([
  createAuthLink({ url, region, auth }),
  createSubscriptionHandshakeLink(
    { url, region, auth },
    createHttpLink({ uri: url }),
  ),
])
const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
})

const AppsyncProvider = ({ children }) => (
  <ApolloProvider client={client}>{children}</ApolloProvider>
)
export default AppsyncProvider

export { client }
