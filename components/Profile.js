import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  TouchableHighlight,
  Text,
  View,
} from 'react-native';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import AsyncStorage from '@react-native-community/async-storage';
import { AuthContext } from '../App';
import { useNavigation } from '@react-navigation/native';

export const PROFILE_QUERY = gql`
  query PROFILE_QUERY($userId: uuid) {
    user(where: {id: {_eq: $userId}}) {
      username
      email
      profile_url
    }
    jobs: trip_aggregate(
      where: {
        driver_id: {_eq: $userId}
        picked_up_at: {_is_null: false}
        dropped_off_at: {_is_null: false}
      }
      order_by: {reserved_at: desc}
    ) {
      aggregate {
        count
      }
    }
  }
`;

export default function Profile() {
  const navigation = useNavigation()
  const { signOut } = React.useContext(AuthContext);
  const [user, setUser] = React.useState(null);
  const { loading, error, data } = useQuery(PROFILE_QUERY, {
    variables: { userId: user ? user.id : null },
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
  const jobTotal = data ? data.jobs.aggregate.count : 0;

  return (
    <SafeAreaView>
      <View style={styles.Ops}>
        <TouchableHighlight style={styles.Button} onPress={signOut}>
          <Text style={styles.ButtonText}>Sign out</Text>
        </TouchableHighlight>
      </View>
      {loading && <ActivityIndicator />}
      {error && <Text>{error}</Text>}
      <View style={styles.content}>
        <Text style={styles.header}>Information</Text>

        {u && (
          <>
            {/* <Text style={styles.Center}>{u.username}</Text> */}
            {/* <Image style={styles.image} source={u.profile_url} /> */}
            <Text style={styles.contentText}>Username: {u.username}</Text>
            <Text style={styles.contentText}>Email: {u.email}</Text>
          </>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={styles.contentText}>Job total: {jobTotal}</Text>
          {jobTotal > 0 && (
            <TouchableHighlight style={[styles.Button, { backgroundColor: '#186b1f' }]} onPress={() => navigation.navigate('JobHistory')}>
              <Text style={styles.ButtonText}>Job histoy</Text>
            </TouchableHighlight>
          )}
        </View>

      </View>


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
  content: {
    marginHorizontal: 5
  },
  contentText: {
    fontSize: 20
  },
  header: {
    fontSize: 26,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#666',
    color: '#888',
    marginVertical: 5,
  },
  Ops: {
    flexDirection: 'row-reverse',
  },
  Button: {
    backgroundColor: "#fc4447aa",
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    elevation: 2,
    margin: 5,
  },
  ButtonText: {
    color: 'white',
  }
});
