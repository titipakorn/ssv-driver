import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableHighlight,
  Text,
  View,
} from 'react-native';
import gql from 'graphql-tag';
import AsyncStorage from '@react-native-community/async-storage';
import { useSubscription } from '@apollo/react-hooks';
import { relativeTime, displayTime, getToday } from '../libs/day';

const QUEUE_SUBSCRIPTION = gql`
  subscription QUEUE_SUBSCRIPTION($userId: uuid, $day: timestamptz) {
    items: trip(
      where: {
        _and: [
          {cancelled_at: {_is_null: true}}
          {dropped_off_at: {_is_null: true}}
          {reserved_at: {_gte: $day}}
          {_or: [{driver_id: null}, {driver_id: {_eq: $userId}}]}
        ]
      }
      order_by: {reserved_at: desc}
    ) {
      id
      from
      to
      user {
        username
      }
      reserved_at
      picked_up_at
      cancelled_at
      driver_id
    }
  }
`;

function Item(row) {
  const { navigation, id, from, to, tmPrimary, tmSecondary, cancelled_at, driver_id, userID } = row;
  let relTime = tmPrimary;
  if (cancelled_at !== null) {
    relTime = 'Cancelled';
  } else if (relTime == 'Passed') {
    relTime = 'Anytime now';
  }
  const isMyJob = driver_id === userID
  let MyJobStyle = {}
  if (isMyJob) MyJobStyle = { backgroundColor: '#35fcd733' }
  return (
    <TouchableHighlight
      activeOpacity={0.8}
      underlayColor="#DDDDDD"
      onPress={() =>
        navigation.navigate('Job', {
          id: id,
          otherParam: 'anything you want here',
        })
      }
      style={[styles.item, MyJobStyle]}>
      <View style={[styles.flexRow]}>
        {from !== null && (
          <View style={[styles.flexColumn, { flex: 1 }]}>
            <Text style={styles.locationPickup}>{from}</Text>
            <Text style={styles.locationDestination}>→ {to}</Text>
          </View>
        )}
        <View style={[styles.flexColumn, { textAlign: 'right' }]}>
          <Text style={[styles.txtPrimary, { alignSelf: 'flex-end' }]}>
            {relTime}
          </Text>
          <Text style={[styles.txtSecondary, { alignSelf: 'flex-end' }]}>
            {tmSecondary}
          </Text>
        </View>
      </View>
    </TouchableHighlight >
  );
}
function itemProcess(data) {
  if (!data) return [];
  if (!data.items) return [];
  return data.items.map(i => ({
    ...i,
    tmPrimary: relativeTime(i.reserved_at),
    tmSecondary: displayTime(i.reserved_at),
  }));
}

export default function AvailableJobs({ navigation }) {
  let intval = React.useRef(null);
  const [user, setUser] = React.useState(null);
  const [items, setItems] = React.useState([]);
  // const [selected, setSelected] = React.useState(new Map());
  const { loading, error, data } = useSubscription(QUEUE_SUBSCRIPTION, {
    shouldResubscribe: true,
    skip: user == null,
    variables: { userId: user ? user.id : null, day: getToday() },
  });
  /* const onSelect = React.useCallback(
    id => {
      const newSelected = new Map(selected);
      newSelected.set(id, !selected.get(id));

      setSelected(newSelected);
    },
    [selected],
  ); */

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

  React.useEffect(() => {
    clearInterval(intval);
    if (data && data.items.length > 0) {
      setItems(itemProcess(data));
      // need to force re-render time although no update data
      intval = setInterval(() => {
        setItems(itemProcess(data));
      }, 5000);
      return () => clearInterval(intval);
    }
  }, [data]);

  // console.log('available jobs: ', error)
  return (
    <>
      {error && <Text>{error.message}</Text>}
      <FlatList
        data={items}
        renderItem={({ item }) => (
          <Item
            {...item}
            userID={user ? user.id : null}
            navigation={navigation}
          // selected={!selected.get(item.id)}
          // onSelect={onSelect}
          />
        )}
        keyExtractor={item => `${item.id}`}
        ListEmptyComponent={() => (
          <Text style={{ textAlign: 'center', paddingVertical: 20 }}>
            No job at the moment, Yay!
          </Text>
        )}
      />
      {loading && <ActivityIndicator style={{ marginVertical: 20 }} />}
    </>
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
  },
  locationDestination: {
    fontSize: 18,
    color: '#888',
  },
  txtPrimary: {
    fontSize: 22,
    color: '#aaa',
  },
  txtSecondary: {
    fontSize: 18,
    color: '#666',
  },
});
