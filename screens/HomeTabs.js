import React from 'react';
import {View, Text, Button} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
// import Icon from 'react-native-vector-icons';
import {AuthContext} from '../App';
import Default from './Default';

const Tab = createBottomTabNavigator();

export function IndexScreen({navigation}) {
  const {signOut} = React.useContext(AuthContext);
  return (
    <View>
      <Text>Signed in!</Text>
      <Button title="Sign out" onPress={signOut} />
      <Button
        title="Go to Jane's profile"
        onPress={() => navigation.navigate('Profile', {name: 'Jane'})}
      />
    </View>
  );
}

export default function HomeTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={IndexScreen} />
      <Tab.Screen name="Profile" component={Default} />
    </Tab.Navigator>
  );
}
