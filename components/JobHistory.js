import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableHighlight,
  TouchableOpacity,
  Text,
  View,
  SafeAreaView,
} from 'react-native';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import AsyncStorage from '@react-native-community/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { Rating } from 'react-native-ratings';
import { displayDatetime, minDuration } from '../libs/day';
import { useNavigation } from '@react-navigation/native';

export const JOB_HISTORY_QUERY = gql`
  query JOB_HISTORY_QUERY($userId: uuid) {
    items: trip(
      where: {
        driver_id: {_eq: $userId}
        picked_up_at: {_is_null: false}
        dropped_off_at: {_is_null: false}
      }
      order_by: {reserved_at: desc}
    ) {
      id
      from
      to
      user {
        username
      }
      is_advanced_reservation
      reserved_at
      accepted_at
      picked_up_at
      dropped_off_at
      driver_feedback
    }
  }
`;

function Item(row) {
  const {
    id,
    from,
    to,
    reserved_at,
    accepted_at,
    picked_up_at,
    dropped_off_at,
    driver_feedback,
  } = row;
  const navigation = useNavigation()
  const duration = minDuration(accepted_at || picked_up_at, dropped_off_at);
  // console.log('driver_feedback: #', id, ' = ', driver_feedback, driver_feedback !== null)
  return (
    <TouchableHighlight
      activeOpacity={0.8}
      underlayColor="#DDDDDD"
      onPress={() =>
        navigation.navigate('Job', {
          id: id,
          otherParam: 'history',
        })
      }
      style={[styles.item]}>
      <View style={styles.flexColumn}>
        <View style={[styles.flexRow, { justifyContent: 'space-between' }]}>
          <Text style={styles.txtPrimary}>{displayDatetime(reserved_at)}</Text>
          <Text style={styles.txtPrimary}>{`${duration.toFixed(0)} min`}</Text>
        </View>
        <View style={styles.flexRow}>
          {from !== null && (
            <View style={[styles.flexColumn, { flex: 1 }]}>
              <Text style={styles.locationPickup}>{from}</Text>
              <Text style={styles.locationDestination}>→ {to}</Text>
            </View>
          )}
          <View style={[styles.flexColumn, { textAlign: 'right' }]}>
            <Icon
              name={'ios-checkmark-circle-outline'}
              size={40}
              color="#999"
            />
            <Text style={styles.txtMuted}>#{id}</Text>
            {/* <Icon name={'ios-radio-button-off'} size={40} color="#999" /> */}
          </View>
        </View>
        <View style={[styles.flexRow, { justifyContent: 'center' }]}>
          {driver_feedback !== null && (
            <Rating
              type="custom"
              startingValue={driver_feedback}
              defaultRating={5}
              readonly={true}
              imageSize={30}
              ratingColor='#04cc82'
              tintColor='#f0f0f0'
              ratingBackgroundColor='white'
            />)}
        </View>
      </View>
    </TouchableHighlight>
  );
}

export default function JobHistory() {
  const [selected, setSelected] = React.useState(new Map());
  const [user, setUser] = React.useState(null);
  const { loading, error, data } = useQuery(JOB_HISTORY_QUERY, {
    skip: user == null,
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

  const onSelect = React.useCallback(
    id => {
      const newSelected = new Map(selected);
      newSelected.set(id, !selected.get(id));

      setSelected(newSelected);
    },
    [selected],
  );

  return (
    <SafeAreaView style={styles.container}>
      {loading && <ActivityIndicator />}
      {error && <Text>{error.message}</Text>}
      {data && (
        <FlatList
          data={data.items}
          renderItem={({ item }) => (
            <Item
              {...item}
              selected={!selected.get(item.id)}
              onSelect={onSelect}
            />
          )}
          keyExtractor={item => `${item.id}`}
          ListEmptyComponent={() => (
            <Text style={{ textAlign: 'center', paddingVertical: 20 }}>
              No job at the moment, Yay!
            </Text>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
  },
  item: {
    paddingHorizontal: 5,
    paddingVertical: 8,
    borderBottomColor: '#ddd',
    borderBottomWidth: 0.5,
  },
  title: {
    fontSize: 32,
    textAlign: 'center',
    paddingBottom: 10,
  },
  flexRow: {
    flexDirection: 'row',
    alignContent: 'space-between',
  },
  flexColumn: {
    flexDirection: 'column',
  },
  locationPickup: {
    fontSize: 24,
    color: '#888',
  },
  locationDestination: {
    fontSize: 18,
    color: '#888',
  },
  txtPrimary: {
    fontSize: 22,
    color: '#222',
  },
  txtSecondary: {
    fontSize: 18,
    color: '#666',
  },
  txtMuted: {
    fontSize: 10,
    color: '#AAA',
    textAlign: 'right',
  }
});
