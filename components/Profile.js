import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Button,
  SafeAreaView,
  Text,
  View,
} from 'react-native';
import gql from 'graphql-tag';
import {useQuery} from '@apollo/react-hooks';
import AsyncStorage from '@react-native-community/async-storage';
import {AuthContext} from '../App';

const PROFILE_QUERY = gql`
  query PROFILE_QUERY($userId: uuid) {
    user(where: {id: {_eq: $userId}}) {
      username
      profile_url
    }
  }
`;

export default function Profile({navigation}) {
  const {signOut} = React.useContext(AuthContext);
  const [user, setUser] = React.useState(null);
  const {loading, error, data} = useQuery(PROFILE_QUERY, {
    variables: {userId: user ? user.id : null},
  });

  React.useEffect(() => {
    // Fetch the token from storage then navigate to our appropriate place
    const bootstrapAsync = async () => {
      try {
        const userTxt = await AsyncStorage.getItem('userResp');
        const userJSON = JSON.parse(userTxt);
        setUser(userJSON);
      } catch (e) {
        // Restoring token failed
      }
    };
    if (user === null) bootstrapAsync();
  }, []);

  const u = data ? data.user[0] : null;

  return (
    <SafeAreaView>
      <Text style={styles.title}>Profile</Text>
      {loading && <ActivityIndicator />}
      {error && <Text>{error}</Text>}

      {u && (
        <>
          <Text style={styles.Center}>{u.username}</Text>
          <Image style={styles.image} source={u.profile_url} />
        </>
      )}

      <Button title="Sign out" onPress={signOut} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  Center: {
    textAlign: 'center',
  },
  title: {
    fontSize: 32,
    textAlign: 'center',
    paddingBottom: 10,
  },
  image: {
    width: 50,
    height: 50,
  },
});
