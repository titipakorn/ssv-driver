import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import gql from 'graphql-tag';
import AsyncStorage from '@react-native-community/async-storage';
import {useSubscription} from '@apollo/react-hooks';
import {useKeepAwake} from 'expo-keep-awake';
import {relativeTime, displayTime} from '../libs/day';
import AcceptJobButton from './AcceptJobButton';
import PickupButton from './PickupButton';
import DropoffButton from './DropoffButton';
import FeedbackButton from './FeedbackButton';
import StopWatch from './StopWatch';
import Map from './Map';
import GeoIndicator from './GeoIndicator';
import {useTranslation} from 'react-i18next';

export default function Job({route}) {
  let intval = useRef(null);
  const {t} = useTranslation();
  const {id} = route.params;
  const [pins, setPins] = useState({
    origin: {},
    destination: {},
  });
  const [userData, setUserData] = useState(null);
  const [item, setItem] = useState({});
  const [geo, setGeo] = useState({
    initialPosition: 'unknown',
    lastPosition: 'unknown',
    error: null,
  });
  const {loading, error, data} = useSubscription(JOB_SUBSCRIPTION, {
    shouldResubscribe: true,
    variables: {id: id},
  });
  useKeepAwake();

  useEffect(() => {
    // Fetch the token from storage then navigate to our appropriate place
    const bootstrapAsync = async () => {
      try {
        const userTxt = await AsyncStorage.getItem('userResp');
        const userJSON = JSON.parse(userTxt);
        setUserData(userJSON);
      } catch (e) {
        // Restoring token failed
      }
    };
    if (userData === null) bootstrapAsync();
  }, []);

  useEffect(() => {
    clearInterval(intval);
    if (data && data.items.length > 0) {
      setItem(process(data, t));
      const c = data.items[0];
      const o = c.place_from || {coordinates: [0, 0]};
      const d = c.place_to || {coordinates: [0, 0]};
      setPins({
        origin: {
          latitude: o.coordinates[1],
          longitude: o.coordinates[0],
          title: c.from,
        },
        destination: {
          latitude: d.coordinates[1],
          longitude: d.coordinates[0],
          title: c.to,
        },
      });
      // need to force re-render time although no update data
      intval = setInterval(() => {
        setItem(process(data, t));
      }, 3000);
      return () => clearInterval(intval);
    }
  }, [data]);
  return (
    <>
      <Map pins={pins} trip={item} handleGeoInfo={setGeo} />
      {loading && <ActivityIndicator />}
      {error && <Text>{error.message}</Text>}
      {item && (
        <ItemDisplay
          geo={geo}
          userID={userData ? userData.id : null}
          item={item}
        />
      )}
    </>
  );
}

function ItemDisplay(props) {
  const {
    id,
    from,
    to,
    step,
    user,
    driver,
    accepted_at,
    picked_up_at,
    dropped_off_at,
    cancelled_at,
    tmPrimary,
    tmSecondary,
    note,
    place_from,
    place_to,
    is_shared,
  } = props.item;
  const {t} = useTranslation();
  const {userID} = props;
  if (!userID) {
    return <ActivityIndicator />;
  }
  let isYourJob = true;
  if (driver && userID != driver.id) {
    isYourJob = false;
  }
  /* STEP:
    1. wait
    2. accept
    3. onboard
    4. done
  */
  // console.log('current step: ', step)
  const isActiveStep = ['accept', 'onboard'].includes(step);
  let isActive = (isYourJob || isActiveStep) && cancelled_at === null;
  let currStep = step;
  let relTime = `${
    tmPrimary !== 'Passed' ? `${t('time.In')} ` : ''
  } ${tmPrimary}`;
  currStep = isYourJob ? step : tmPrimary === 'Passed' ? 'passed' : step;
  if (cancelled_at !== null) {
    relTime = t('job.Cancelled');
  }
  // if (step == "wait" && tmPrimary === 'Passed') {
  //   // still active, but past pickup time -- no driver available or something
  //   currStep =
  // } else {
  // }

  const openMapApp = ({lat, lng, label}) => {
    const scheme = Platform.select({ios: 'maps:0,0?q=', android: 'geo:0,0?q='});
    const latLng = `${lat},${lng}`;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });
    Linking.openURL(url);
  };

  const openGoogleMap = ({lat, lng}) => {
    Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&destination=` +
        lat +
        `,` +
        lng +
        `&travelmode=driving`,
    );
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'space-between',
      }}>
      {isActive && isActiveStep && (
        <View
          style={{
            height: 30,
            backgroundColor: '#15c146',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text style={{color: 'white'}}>
            {t('job.ActiveStatus')} - <StopWatch startTime={accepted_at} />
          </Text>
        </View>
      )}
      {!isActive && (
        <View
          style={{
            height: 30,
            backgroundColor: '#ccc',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text style={{color: '#444'}}>{t('job.InactiveStatus')}</Text>
        </View>
      )}
      <ScrollView style={{paddingHorizontal: 5}}>
        <View
          style={[
            styles.flexRow,
            {textAlign: 'right', justifyContent: 'space-between'},
          ]}>
          <Text style={[styles.txtPrimary, {alignSelf: 'flex-end'}]}>
            {relTime}
          </Text>
          <View style={[styles.flexRow, {alignItems: 'baseline'}]}>
            <Text style={[styles.txtSecondary, {alignSelf: 'flex-end'}]}>
              {t('time.At')} {tmSecondary}
            </Text>
            <GeoIndicator
              error={props.geo.error}
              position={props.geo.lastPosition}
            />
          </View>
        </View>
        <View style={[styles.flexColumn]}>
          <Text style={styles.locationActive}>{from}</Text>
          <Text style={styles.locationInActive}>→ {to}</Text>
        </View>
        <Text
          style={{
            color: '#888',
            marginVertical: 10,
            fontSize: 20,
            textAlign: 'center',
          }}>
          {`${t('job.ID')} ${id}`}
        </Text>
        {note && (
          <Text
            style={{
              color: 'red',
              marginVertical: 10,
              fontSize: 20,
              textAlign: 'center',
            }}>
            {`${note}`}
          </Text>
        )}
        {user && (
          <Text
            style={[
              styles.locationInActive,
              {color: '#333', textAlign: 'center'},
            ]}>
            {user.username}
          </Text>
        )}
      </ScrollView>
      {/* can start job only now and future job */}
      {currStep === 'wait' && cancelled_at === null && (
        <AcceptJobButton jobID={id} userID={userID} isShared={is_shared} />
      )}
      {isYourJob && cancelled_at === null && (
        <>
          {currStep === 'accept' && (
            <>
              <TouchableOpacity
                style={{
                  backgroundColor: '#15c146',
                  height: 55,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 10,
                }}
                onPress={() => {
                  openMapApp({
                    lat: place_from.coordinates[1],
                    lng: place_from.coordinates[0],
                    label: from,
                  });
                }}>
                <Text
                  style={[
                    {
                      color: 'white',
                      fontSize: 36,
                    },
                  ]}>
                  {t('job.navigate')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: '#15c146',
                  height: 55,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 10,
                }}
                onPress={() => {
                  openGoogleMap({
                    lat: place_from.coordinates[1],
                    lng: place_from.coordinates[0],
                  });
                }}>
                <Text
                  style={[
                    {
                      color: 'white',
                      fontSize: 36,
                    },
                  ]}>
                  {t('job.navigateGoogle')}
                </Text>
              </TouchableOpacity>
              <PickupButton jobID={id} />
            </>
          )}
          {currStep === 'onboard' && (
            <>
              <TouchableOpacity
                style={{
                  backgroundColor: '#15c146',
                  height: 55,
                  marginBottom: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => {
                  openMapApp({
                    lat: place_to.coordinates[1],
                    lng: place_to.coordinates[0],
                    label: to,
                  });
                }}>
                <Text
                  style={[
                    {
                      color: 'white',
                      fontSize: 36,
                    },
                  ]}>
                  {t('job.navigate')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: '#15c146',
                  height: 55,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 10,
                }}
                onPress={() => {
                  openGoogleMap({
                    lat: place_to.coordinates[1],
                    lng: place_to.coordinates[0],
                  });
                }}>
                <Text
                  style={[
                    {
                      color: 'white',
                      fontSize: 36,
                    },
                  ]}>
                  {t('job.navigateGoogle')}
                </Text>
              </TouchableOpacity>
              <DropoffButton jobID={id} />
            </>
          )}
          {/* {currStep === 'done' && <FeedbackButton jobID={id} userID={userID} />} */}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
  },
  button: {
    width: 60,
    height: 60,
  },
  item: {
    paddingHorizontal: 5,
    paddingVertical: 8,
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
  locationActive: {
    fontSize: 35,
  },
  locationInActive: {
    fontSize: 28,
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

const JOB_SUBSCRIPTION = gql`
  subscription JOB_SUBSCRIPTION($id: Int!) {
    items: trip(where: {id: {_eq: $id}}) {
      id
      from
      to
      place_from
      place_to
      user {
        username
      }
      driver {
        id
      }
      note
      reserved_at
      accepted_at
      picked_up_at
      dropped_off_at
      cancelled_at
      driver_feedback
      polyline
      is_shared
      traces(order_by: {timestamp: desc}) {
        timestamp
        point
      }
    }
  }
`;

function process(data, t) {
  const o = data.items[0];
  /* STEP:
    1. wait
    2. accept
    3. onboard
    4. done [wait for feedback]
    5. over
  */
  let step = 'wait';
  if (o.dropped_off_at != null) {
    step = o.driver_feedback === null ? 'done' : 'over';
  } else if (o.picked_up_at !== null) {
    step = 'onboard';
  } else if (o.accepted_at !== null) {
    step = 'accept';
  }
  return {
    ...o,
    tmPrimary: relativeTime(o.reserved_at, t),
    tmSecondary: displayTime(o.reserved_at),
    step,
  };
}
