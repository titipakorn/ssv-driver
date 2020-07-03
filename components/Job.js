import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
} from 'react-native';
import gql from 'graphql-tag';
import AsyncStorage from '@react-native-community/async-storage';
import {useSubscription} from '@apollo/react-hooks';
import MapView from 'react-native-maps';
import {relativeTime, displayTime} from '../libs/day';
import AcceptJobButton from './AcceptJobButton';
import PickupButton from './PickupButton';
import DropoffButton from './DropoffButton';
import FeedbackButton from './FeedbackButton';

const JOB_SUBSCRIPTION = gql`
  subscription JOB_SUBSCRIPTION($id: smallint) {
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
      reserved_at
      picked_up_at
      dropped_off_at
    }
  }
`;

function ItemDisplay(props) {
  const {
    id,
    from,
    to,
    user,
    driver,
    reserved_at,
    picked_up_at,
    dropped_off_at,
    tmPrimary,
    tmSecondary,
  } = props.item;
  const {userID} = props;
  if (!userID) {
    return <ActivityIndicator />;
  }
  const isYourJob = driver ? userID == driver.id : false;
  /* Step to complete stuffs
  1. [available] Unacquire job (driver.id == null)
  2. [start] Start working on job
    * driver.id == userID
    * reserved_at --> future
    * picked_up, dropped_off == null
  3. [picked_up] Picked UP customer
    * driver.id == userID
    * reserved_at - passed
    * picked_up -- assigned
    * dropped_off == null
  4. [dropped_off] Dropped Off customer
    * driver.id == userID
    * reserved_at - passed
    * picked_up -- assigned
    * dropped_off -- assigned
  5. [feedback] Feedback
    * all & rated
    ~ TODO: Don't have a clue yet.
  */
  let currStep = 'available';
  let isActive = false;
  // console.log('isYourJob', isYourJob, driver)
  if (isYourJob) {
    isActive = true;
    // console.log('pick/drop', picked_up_at, dropped_off_at);
    if (picked_up_at !== null && dropped_off_at !== null) {
      // TODO: add no feedback critiria
      currStep = 'dropped_off';
      isActive = false;
    } else if (picked_up_at !== null && dropped_off_at === null) {
      currStep = 'picked_up';
    } else if (picked_up_at === null && dropped_off_at === null) {
      currStep = 'start';
    }
  } else {
    if (tmPrimary === 'Passed') {
      // prevent doing anything at all if it's not your job
      currStep = '';
    }
  }
  console.log('CURRENT STEP: ', currStep);
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'space-between',
      }}>
      {isActive && (
        <View
          style={{
            height: 30,
            backgroundColor: '#15c146',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text style={{color: 'white'}}>ACTIVE</Text>
        </View>
      )}
      {!isActive && currStep !== 'available' && (
        <View
          style={{
            height: 30,
            backgroundColor: '#ccc',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text style={{color: '#444'}}>INACTIVE</Text>
        </View>
      )}
      <View style={{paddingHorizontal: 5}}>
        <View
          style={[
            styles.flexRow,
            {textAlign: 'right', justifyContent: 'space-between'},
          ]}>
          <Text style={[styles.txtPrimary, {alignSelf: 'flex-end'}]}>
            In {tmPrimary}
          </Text>
          <Text style={[styles.txtSecondary, {alignSelf: 'flex-end'}]}>
            At {tmSecondary}
          </Text>
        </View>
        <View style={[styles.flexColumn]}>
          <Text style={styles.locationActive}>{from}</Text>
          <Text style={styles.locationInActive}>→ {to}</Text>
        </View>
        <Text style={{color: '#888', marginVertical: 10}}>
          Pickup Information
        </Text>
        {user && (
          <Text
            style={[
              styles.locationInActive,
              {color: '#333', textAlign: 'center'},
            ]}>
            {user.username}
          </Text>
        )}
      </View>
      <View
        style={{
          marginVertical: 20,
          flexDirection: 'row',
          justifyContent: 'space-around',
        }}>
        <TouchableOpacity
          onPress={() => Alert.alert('Button with adjusted color pressed')}>
          <Image
            style={styles.button}
            source={require('../static/message.png')}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              'Alert Title',
              'My Alert Msg',
              [
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                {text: 'OK', onPress: () => console.log('OK Pressed')},
              ],
              {cancelable: false},
            )
          }>
          <Image
            style={styles.button}
            source={require('../static/phone.png')}
          />
        </TouchableOpacity>
      </View>
      {/* can start job only now and future job */}
      {currStep === 'available' && (
        <AcceptJobButton jobID={id} userID={userID} />
      )}
      {currStep === 'start' && <PickupButton jobID={id} />}
      {currStep === 'picked_up' && <DropoffButton jobID={id} />}
      {currStep === 'dropped_off' && <FeedbackButton jobID={id} />}
    </View>
  );
}

function process(data) {
  const o = data.items[0];
  return {
    ...o,
    tmPrimary: relativeTime(o.reserved_at),
    tmSecondary: displayTime(o.reserved_at),
  };
}

export default function Job({navigation, route}) {
  let intval = React.useRef(null);
  const {id} = route.params;
  const [userData, setUserData] = React.useState({});
  const [item, setItem] = React.useState({});
  const {loading, error, data} = useSubscription(JOB_SUBSCRIPTION, {
    shouldResubscribe: true,
    variables: {id: id},
  });

  React.useEffect(() => {
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

    bootstrapAsync();
  }, []);

  React.useEffect(() => {
    clearInterval(intval);
    if (data && data.items.length > 0) {
      setItem(process(data));
      // need to force re-render time although no update data
      intval = setInterval(() => {
        setItem(process(data));
      }, 3000);
      return () => clearInterval(intval);
    }
  }, [data]);
  return (
    <>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 13.7385,
          longitude: 100.5706,
          latitudeDelta: 0.0122,
          longitudeDelta: 0.0121,
        }}
      />
      {loading && <ActivityIndicator />}
      {error && <Text>{error.message}</Text>}
      {item && (
        <ItemDisplay userID={userData ? userData.id : null} item={item} />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
  },
  map: {
    height: 275,
    marginVertical: 0,
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
    fontSize: 40,
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
