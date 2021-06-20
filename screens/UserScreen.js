import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {useTranslation} from 'react-i18next';
import Profile from '../components/Profile';
import JobHistory from '../components/JobHistory';

const UserStack = createStackNavigator();

export default function UserScreen() {
  return (
    <UserStack.Navigator
      screenOptions={{
        headerShown: true,
      }}>
      <UserStack.Screen
        name={'Profile'}
        component={Profile}
        options={{
          animationEnabled: true,
        }}
      />
      <UserStack.Screen
        name={'JobHistory'}
        component={JobHistory}
        options={{
          animationEnabled: true,
        }}
      />
    </UserStack.Navigator>
  );
}
