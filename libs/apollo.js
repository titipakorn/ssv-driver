import AsyncStorage from '@react-native-community/async-storage';
import {ApolloClient} from 'apollo-client';
import {HttpLink} from 'apollo-link-http';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {setContext} from 'apollo-link-context';
import {onError} from 'apollo-link-error';

const httpLink = new HttpLink({uri: 'https://gql.10z.dev/v1/graphql'});

let token;
const withToken = setContext(async request => {
  let headers;
  if (!token) {
    const val = await AsyncStorage.getItem('userResp');
    let u = JSON.parse(val);
    token = u.token;
    headers = {
      Authorization: `Bearer ${u.token}`,
      'X-Hasura-User-Id': u.username,
      'X-Hasura-Role': u.roles.length > 0 ? u.roles[0] : '',
    };
    return { headers }
  }
  return {
    headers: {}
  }
  // console.log('WITH TOKEN: ', u, token)
  // const h = {
  //   headers: ,
  // };
  // console.log(h)
  // return h
});

const resetToken = onError(({networkError}) => {
  if (networkError && networkError.statusCode === 401) {
    // remove cached token on 401 from the server
    token = undefined;
  }
});

const authFlowLink = withToken.concat(resetToken);

const link = authFlowLink.concat(httpLink);

const cache = new InMemoryCache();

export default new ApolloClient({
  link,
  cache,
});
