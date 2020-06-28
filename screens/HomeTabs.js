import React from 'react';
import {View, Text, Button, SafeAreaView, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import {AuthContext} from '../App';
import Default from './Default';
import AvailableJobs from '../components/AvailableJobs';

const Tab = createBottomTabNavigator();

export function IndexScreen({navigation}) {
  const {signOut} = React.useContext(AuthContext);
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Available Jobs</Text>
      <AvailableJobs />
      {/* <Button title="Sign out" onPress={signOut} />
      <Button
        title="Go to Jane's profile"
        onPress={() => navigation.navigate('Profile', {name: 'Jane'})}
      /> */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 0,
  },
  title: {
    fontSize: 25,
    color: "#444",
    textAlign: "center"
  }
});
