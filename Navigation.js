import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useQuery } from '@apollo/react-hooks';
import AsyncStorage from '@react-native-community/async-storage';
import HomeTabs from './screens/HomeTabs';
import SplashScreen from './screens/Splash';
import SignInScreen from './screens/SignIn';
import { PROFILE_QUERY } from './components/Profile';
import { AuthContext } from './App';

const Stack = createStackNavigator();

export default function Navi({ userToken, isSignout }) {
  const { signOut } = React.useContext(AuthContext);
  const [user, setUser] = React.useState(undefined);
  const [validated, setValidation] = React.useState(false)
  const { loading, error, data } = useQuery(PROFILE_QUERY, {
    variables: { userId: user ? user.id : null },
    skip: !user
  });

  React.useEffect(() => {
    // Fetch the token from storage then navigate to our appropriate place
    const bootstrapAsync = async () => {
      try {
        const userTxt = await AsyncStorage.getItem('userResp');
        const userJSON = JSON.parse(userTxt);
        setUser(userJSON);
        // console.log('userjson', userJSON, userJSON === null)
        if (userJSON === null) {
          setValidation(true)
        }
      } catch (e) {
        // Restoring token failed
        signOut()
        setValidation(true)
      }
    };
    if (user === undefined) bootstrapAsync();
  }, []);

  React.useEffect(() => {
    // console.log(' effect :: ', error, data, userToken, user)
    if (user === undefined || loading) {
      return
    } else {
      if (user === null) {
        setValidation(true) // no token anyway
      }
      if (error) {
        const errMsg = error.message.toLowerCase()
        if (errMsg.indexOf('jwtexpired')) {
          signOut()
        }
      }
      if (data && data.user.length > 0) {
        setValidation(true)
      }
    }
  }, [user, data, error]);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        {!validated ? (
          // We haven't finished checking for the token yet
          <Stack.Screen name="Splash" component={SplashScreen} />
        ) : userToken == null ? (
          // No token found, user isn't signed in
          <Stack.Screen
            name="SignIn"
            component={SignInScreen}
            options={{
              title: 'Sign in',
              // When logging out, a pop animation feels intuitive
              animationTypeForReplace: isSignout ? 'pop' : 'push',
            }}
          />
        ) : (
              <Stack.Screen name="Home" component={HomeTabs} />
            )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}