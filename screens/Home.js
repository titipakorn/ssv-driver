import React from 'react';
import {View, Text, Button} from 'react-native';
import {AuthContext} from '../App';

export default function HomeScreen({navigation}) {
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
