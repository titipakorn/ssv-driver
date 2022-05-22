import 'react-native-gesture-handler';
import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import {Platform} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {ApolloProvider} from '@apollo/react-hooks';
import apolloClient from './libs/apollo';
import {RecoilRoot} from 'recoil';
import Navi from './Navigation';

Icon.loadFont();

export const AuthContext = React.createContext();

const App = () => {
  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            userToken: action.token,
            isLoading: false,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            userToken: action.token,
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
            userToken: null,
          };
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
    },
  );

  React.useEffect(() => {
    // Fetch the token from storage then navigate to our appropriate place
    const bootstrapAsync = async () => {
      let userToken;

      try {
        userToken = await AsyncStorage.getItem('userToken');
      } catch (e) {
        // Restoring token failed
      }

      // After restoring token, we may need to validate it in production apps

      // This will switch to the App screen or Auth screen and this loading
      // screen will be unmounted and thrown away.
      dispatch({type: 'RESTORE_TOKEN', token: userToken});
    };

    bootstrapAsync();
  }, []);

  const authContext = React.useMemo(
    () => ({
      signIn: async (data) => {
        // In a production app, we need to send some data (usually username, password) to server and get a token
        // We will also need to handle errors if sign in failed
        // After getting token, we need to persist the token using `AsyncStorage`
        // In the example, we'll use a dummy token
        const keys = Object.keys(data);
        if (keys.includes('errors')) {
          if (Platform.OS === 'android') {
            await AsyncStorage.clear();
          }
          if (Platform.OS === 'ios') {
            await AsyncStorage.getAllKeys().then(AsyncStorage.multiRemove);
          }
        } else {
          AsyncStorage.setItem('userToken', data.token);
          AsyncStorage.setItem('userResp', JSON.stringify(data));
          dispatch({type: 'SIGN_IN', token: data.token});
        }
        //console.log('data == > ', data)
      },
      signOut: async () => {
        if (Platform.OS === 'android') {
          await AsyncStorage.clear();
        }
        if (Platform.OS === 'ios') {
          await AsyncStorage.getAllKeys().then(AsyncStorage.multiRemove);
        }
        dispatch({type: 'SIGN_OUT'});
      },
      signUp: async (data) => {
        // In a production app, we need to send user data to server and get a token
        // We will also need to handle errors if sign up failed
        // After getting token, we need to persist the token using `AsyncStorage`
        // In the example, we'll use a dummy token
        dispatch({type: 'SIGN_IN', token: ''});
      },
    }),
    [],
  );

  return (
    <AuthContext.Provider value={authContext}>
      <ApolloProvider client={apolloClient}>
        <RecoilRoot>
          <Navi
            isLoading={state.isLoading}
            userToken={state.userToken}
            isSignout={state.isSignout}
          />
        </RecoilRoot>
      </ApolloProvider>
    </AuthContext.Provider>
  );
};

export default App;
