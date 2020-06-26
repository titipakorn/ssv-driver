import React from 'react';
import {View, Text, Button, SafeAreaView} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import {AuthContext} from '../App';
import Default from './Default';
import gql from 'graphql-tag';
import {useQuery, useSubscription} from '@apollo/react-hooks';

const Tab = createBottomTabNavigator();

const QUEUE_SUBSCRIPTION = gql`
  subscription QUEUE_SUBSCRIPTION {
    items: trip(
      where: {dropped_off_at: {_is_null: true}, _or: [{driver_id: null}]}
    ) {
      id
      place_from
      place_to
      user {
        username
      }
      is_advanced_reservation
      reserved_at
      picked_up_at
    }
  }
`;

export function IndexScreen({navigation}) {
  const {loading, error, data} = useSubscription(QUEUE_SUBSCRIPTION, {
    shouldResubscribe: true,
    variables: {},
  });
  const {signOut} = React.useContext(AuthContext);
  console.log('Index WSS: ', loading, error, data);
  return (
    <SafeAreaView>
      <Text>Signed in!</Text>
      <Text>Result from GQL subscription: {data && data.items.length}</Text>
      <Button title="Sign out" onPress={signOut} />
      <Button
        title="Go to Jane's profile"
        onPress={() => navigation.navigate('Profile', {name: 'Jane'})}
      />
    </SafeAreaView>
  );
}

export default function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: true,
        tabBarIcon: ({focused, color, size}) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'ios-car' : 'ios-filing';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'ios-contact' : 'ios-contact';
          }
          // You can return any component that you like here!
          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
      tabBarOptions={{
        activeTintColor: 'tomato',
        inactiveTintColor: 'gray',
      }}>
      <Tab.Screen name="Home" component={IndexScreen} />
      <Tab.Screen name="Profile" component={Default} />
    </Tab.Navigator>
  );
}
