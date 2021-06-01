import React, { useEffect, useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { useKeepAwake } from 'expo-keep-awake';
import OverlayComponent from './OverlayComponent';
import JobOverlay from './JobOverly';

const QUEUE_SUBSCRIPTION = gql`
  subscription QUEUE_SUBSCRIPTION($userId: uuid, $day: timestamptz) {
    items: trip(
      where: {
        _and: [
          {cancelled_at: {_is_null: true}}
          {picked_up_at: {_is_null: true}}
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
  const navigation = useNavigation()
  const { id, from, to, tmPrimary, tmSecondary, cancelled_at, driver_id, userID } = row;
  let relTime = tmPrimary;
  if (cancelled_at !== null) {
    relTime = 'Cancelled';
  } else if (relTime == 'Passed') {
    relTime = 'Anytime now';
  }
  const isMyJob = driver_id === userID
  const taken = driver_id !== null && !isMyJob
  let MyJobStyle = {}
  if (isMyJob) MyJobStyle = { backgroundColor: '#35fcd733' }

  // TODO: recalculate time..

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
            <Text style={styles.locationPickup}>
              {taken ? '/taken/' : ''}
              {from}
            </Text>
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

function AvailableJobs({ isWorking }) {
  let intval = React.useRef(null);
  const [user, setUser] = React.useState(null);
  const [items, setItems] = React.useState([]);
  const [tm, setTm] = React.useState(getToday());
  // const [selected, setSelected] = React.useState(new Map());
  const { loading, error, data } = useSubscription(QUEUE_SUBSCRIPTION, {
    shouldResubscribe: isWorking,
    skip: !isWorking || user == null,
    variables: { userId: user ? user.id : null, day: tm },
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
    const timer = setInterval(() => {
      setTm(getToday());
      // console.log('setTm: ', tm);
    }, 5000);
    // clearing interval
    return () => clearInterval(timer);
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

  React.useEffect(() => {
    clearInterval(intval);
    if (!loading && data && data.items) {

      if (data.items.length === 0) {
        setItems([])
      } else {
        setItems(itemProcess(data));
        // need to force re-render time although no update data
        intval = setInterval(() => {
          setItems(itemProcess(data));
        }, 5000);
      }
      return () => clearInterval(intval);
    }
  }, [data]);

  useEffect(() => {
    if (!isWorking) {
      setItems([])
    }
  }, [isWorking])

  useKeepAwake()

  const emptyText = isWorking ? 'No job at the moment, Yay!' : 'This feed is not live yet'

  // console.log('available jobs: ', error)
  return (
    <View
      style={{
        width: '100%',
        height: '100%',
      }}>
      {error && <Text>{error.message}</Text>}
      <FlatList
        data={items}
        renderItem={({ item }) => (
          <Item
            {...item}
            userID={user ? user.id : null}
          // selected={!selected.get(item.id)}
          // onSelect={onSelect}
          />
        )}
        keyExtractor={item => `${item.id}`}
        ListEmptyComponent={() => (
          <Text style={{ textAlign: 'center', paddingVertical: 20 }}>
            {emptyText}
          </Text>
        )}
      />
      {loading && <ActivityIndicator style={{ marginVertical: 20 }} />}
    </View>
  );
}


export default function AvailableJobsContainer() {
  const [working, setWorking] = useState(false)
  return <OverlayComponent
    behind={<AvailableJobs isWorking={working} />}
    front={<JobOverlay isWorking={working} setWorking={setWorking} />}
  />
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
