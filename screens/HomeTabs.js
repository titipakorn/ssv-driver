import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import Profile from '../components/Profile';
import AvailableJobs from '../components/AvailableJobs';
import Job from '../components/Job';
import JobHistory from '../components/JobHistory';

const Tab = createBottomTabNavigator();
const MainStack = createStackNavigator();

export function IndexScreen() {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: true,
      }}>
      <MainStack.Screen
        name="Job queue"
        component={AvailableJobs}
        options={{
          animationEnabled: true,
        }}
      />
      <MainStack.Screen
        name="Job"
        component={Job}
        options={{
          animationEnabled: true,
        }}
      />
    </MainStack.Navigator>
  );
}
/*     <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Available Jobs</Text>
      <AvailableJobs />
    <Button title="Sign out" onPress={signOut} />
      <Button
        title="Go to Jane's profile"
        onPress={() => navigation.navigate('Profile', {name: 'Jane'})}
      />
    </SafeAreaView>*/

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
          } else if (route.name === 'History') {
            iconName = focused ? 'ios-list' : 'ios-list';
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
      <Tab.Screen name="History" component={JobHistory} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}
