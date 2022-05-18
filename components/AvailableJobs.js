import React, {useEffect, useState, useRef} from 'react';
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
import {useSubscription} from '@apollo/react-hooks';
import {relativeTime, displayTime, getToday} from '../libs/day';
import {useNavigation} from '@react-navigation/native';
import {useKeepAwake} from 'expo-keep-awake';
import OverlayComponent from './OverlayComponent';
import JobOverlay from './JobOverly';
import {useTranslation} from 'react-i18next';
import RNBeep from 'react-native-a-beep';

export default function AvailableJobsContainer() {
  const [user, setUser] = useState({});
  const [working, setWorking] = useState(false);

  useEffect(() => {
    // Fetch the token from storage then navigate to our appropriate place
    const bootstrapAsync = async () => {
      try {
        const userTxt = await AsyncStorage.getItem('userResp');
        const userJSON = JSON.parse(userTxt);
        setUser(userJSON);
      } catch (e) {
        // Restoring token failed
        // console.log('err: ', e);
      }
    };
    if (!user.id) bootstrapAsync();
  }, []);

  if (!user.id) {
    return (
      <View>
        <Text style={{textAlign: 'center', paddingVertical: 100}}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <OverlayComponent
      behind={<AvailableJobs isWorking={working} user={user} />}
      front={
        <JobOverlay isWorking={working} setWorking={setWorking} user={user} />
      }
    />
  );
}

function AvailableJobs({isWorking, user}) {
  let intval = useRef(null);
  const {t} = useTranslation();
  const [items, setItems] = useState([]);
  const [tm, setTm] = useState(getToday());
  // const [selected, setSelected] = useState(new Map());
  const {loading, error, data} = useSubscription(QUEUE_SUBSCRIPTION, {
    shouldResubscribe: isWorking,
    skip: !isWorking || user == null,
    variables: {userId: user ? user.id : null, day: tm},
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTm(getToday());
    }, 5000);
    // clearing interval
    return () => clearInterval(timer);
  });

  useEffect(() => {
    clearInterval(intval);
    if (!loading && data && data.items) {
      if (data.items.length === 0) {
        setItems([]);
      } else {
        if (data.items.length != items.length) {
          RNBeep.PlaySysSound(RNBeep.iOSSoundIDs.Voicemail);
        }
        setItems(itemProcess(data, t));
        // need to force re-render time although no update data
        intval = setInterval(() => {
          setItems(itemProcess(data, t));
        }, 5000);
      }
      return () => clearInterval(intval);
    }
  }, [data]);

  useEffect(() => {
    if (!isWorking) {
      setItems([]);
    }
  }, [isWorking]);

  useKeepAwake();

  const emptyText = isWorking
    ? t('jobList.EmptyJob')
    : t('jobList.InactiveFeed');

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
        renderItem={({item}) => (
          <Item
            {...item}
            userID={user ? user.id : null}
            // selected={!selected.get(item.id)}
            // onSelect={onSelect}
          />
        )}
        keyExtractor={(item) => `${item.id}`}
        ListEmptyComponent={() => (
          <Text style={{textAlign: 'center', paddingVertical: 20}}>
            {emptyText}
          </Text>
        )}
      />
      {loading && <ActivityIndicator style={{marginVertical: 20}} />}
    </View>
  );
}

function Item(row) {
  const {t} = useTranslation();
  const navigation = useNavigation();
  const {
    id,
    from,
    to,
    tmPrimary,
    tmSecondary,
    cancelled_at,
    driver_id,
    driver,
    userID,
  } = row;
  let relTime = tmPrimary;
  if (cancelled_at !== null) {
    relTime = t('job.Cancelled');
  } else if (relTime == 'Passed') {
    relTime = t('job.Passed');
  }
  const isMyJob = driver_id === userID;
  const taken = driver_id !== null && !isMyJob;
  let MyJobStyle = {};
  if (isMyJob) MyJobStyle = {backgroundColor: '#35fcd733'};

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
          <View style={[styles.flexColumn, {flex: 1}]}>
            <Text style={styles.jobId}>Job ID {id}</Text>
            <Text style={styles.locationPickup}>
              {taken ? '/taken/' : ''}
              {from}
            </Text>
            <Text style={styles.locationDestination}>→ {to}</Text>
          </View>
        )}
        <View style={[styles.flexColumn, {textAlign: 'right'}]}>
          <Text style={[styles.txtPrimary, {alignSelf: 'flex-end'}]}>
            {relTime}
          </Text>
          <Text style={[styles.txtSecondary, {alignSelf: 'flex-end'}]}>
            {tmSecondary}
          </Text>
          <Text style={[styles.txtSecondary, {alignSelf: 'flex-end'}]}>
            {driver?.username}
          </Text>
        </View>
      </View>
    </TouchableHighlight>
  );
}

function itemProcess(data, t) {
  if (!data) return [];
  if (!data.items) return [];
  return data.items.map((i) => ({
    ...i,
    tmPrimary: relativeTime(i.reserved_at, t),
    tmSecondary: displayTime(i.reserved_at),
  }));
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
  jobId: {
    fontSize: 18,
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
      driver {
        id
        username
      }
    }
  }
`;
