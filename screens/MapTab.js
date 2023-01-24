import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {useTranslation} from 'react-i18next';
import MonitorMap from '../components/MonitorMap';
import JobHistory from '../components/JobHistory';

const UserStack = createStackNavigator();

export default function UserScreen() {
  const {t} = useTranslation();

  return (
    <UserStack.Navigator
      screenOptions={{
        headerShown: true,
      }}>
      <UserStack.Screen
        name={'MonitorMap'}
        component={MonitorMap}
        options={{
          animationEnabled: true,
          title: t('map.Title'),
        }}
      />
    </UserStack.Navigator>
  );
}
