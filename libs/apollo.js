import AsyncStorage from '@react-native-community/async-storage';
import {ApolloClient} from 'apollo-client';
import {WebSocketLink} from 'apollo-link-ws';
import {HttpLink} from 'apollo-link-http';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {setContext} from 'apollo-link-context';
import {onError} from 'apollo-link-error';
import {split} from 'apollo-link';
import {getMainDefinition} from 'apollo-utilities';

const httpLink = new HttpLink({uri: 'https://gql.10z.dev/v1/graphql'});

// Create a WebSocket link:
const wsLink = new WebSocketLink({
  uri: 'wss://gql.10z.dev/v1/graphql',
  options: {
    lazy: true,
    reconnect: true,
    connectionParams: async () => {
      const token = await AsyncStorage.getItem('userToken');
      return {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
    },
  },
});

let userResp;
const withToken = setContext(async request => {
  if (!userResp) {
    const val = await AsyncStorage.getItem('userResp');
    let u = JSON.parse(val);
    userResp = u;
  }
  const {token, username, roles} = userResp;
  const headers = {
    Authorization: `Bearer ${token}`,
    'X-Hasura-User-Id': username,
    'X-Hasura-Role': roles.length > 0 ? roles[0] : '',
  };
  return {headers};
});

const resetToken = onError(({networkError}) => {
  if (networkError && networkError.statusCode === 401) {
    // remove cached token on 401 from the server
    token = undefined;
  }
});

const authFlowLink = withToken.concat(resetToken);

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const link = split(
  // split based on operation type
  ({query}) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authFlowLink.concat(httpLink),
);

// const link = authFlowLink.concat(httpLink);

const cache = new InMemoryCache();

export default new ApolloClient({
  link,
  cache,
});
