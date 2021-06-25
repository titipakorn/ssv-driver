import {useMutation, useSubscription} from '@apollo/react-hooks';
import dayjs from 'dayjs';
import {activateKeepAwake, deactivateKeepAwake} from 'expo-keep-awake';
import gql from 'graphql-tag';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Modal, Image, StyleSheet, Text, View} from 'react-native';
import {Icon} from 'react-native-elements';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {SvgXml} from 'react-native-svg';
import {hhmmDuration} from '../libs/day';
import GeoLocationProvider from './GeoLocationProvider';
import {modelStyles} from './Modal';
import SsvModel1 from './ssv-model-1.svg';
import SsvModel2 from './ssv-model-2.svg';
import SsvModel3 from './ssv-model-3.svg';

const GREEN = 'rgba(68, 252, 148, 0.3)';
const YELLOW = 'rgba(252, 186, 3, 0.5)';
const RED = 'rgba(249, 88, 67, 0.5)';

const xml = `
  <svg width="32" height="32" viewBox="0 0 32 32">
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      fill="url(#gradient)"
      d="M4 0C1.79086 0 0 1.79086 0 4V28C0 30.2091 1.79086 32 4 32H28C30.2091 32 32 30.2091 32 28V4C32 1.79086 30.2091 0 28 0H4ZM17 6C17 5.44772 17.4477 5 18 5H20C20.5523 5 21 5.44772 21 6V25C21 25.5523 20.5523 26 20 26H18C17.4477 26 17 25.5523 17 25V6ZM12 11C11.4477 11 11 11.4477 11 12V25C11 25.5523 11.4477 26 12 26H14C14.5523 26 15 25.5523 15 25V12C15 11.4477 14.5523 11 14 11H12ZM6 18C5.44772 18 5 18.4477 5 19V25C5 25.5523 5.44772 26 6 26H8C8.55228 26 9 25.5523 9 25V19C9 18.4477 8.55228 18 8 18H6ZM24 14C23.4477 14 23 14.4477 23 15V25C23 25.5523 23.4477 26 24 26H26C26.5523 26 27 25.5523 27 25V15C27 14.4477 26.5523 14 26 14H24Z"
    />
    <defs>
      <linearGradient
        id="gradient"
        x1="0"
        y1="0"
        x2="8.46631"
        y2="37.3364"
        gradient-units="userSpaceOnUse">
        <stop offset="0" stop-color="#FEA267" />
        <stop offset="1" stop-color="#E75A4C" />
      </linearGradient>
    </defs>
  </svg>
`;

function getVehicleID(data) {
  if (!data) return '';
  if (!data.working_shift) return '';
  if (data.working_shift.length === 0) return '';
  return data.working_shift[0].vehicle_id;
}

export default function JobOverlay({isWorking, setWorking, user}) {
  const {t} = useTranslation();
  const [geo, setGeo] = useState(null);
  const [lastGeoTimestamp, setLastGeoTimestamp] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [shiftID, setShiftID] = useState(-1);
  const {data, loading} = useSubscription(ACTIVE_WORKING_SHIFT, {
    variables: {userId: user.id},
  });
  const [shiftDuration, setShiftDuration] = useState('');
  const [startWorking, {loading: startLoading, error: startError}] =
    useMutation(START_WORKING_MUTATION);
  const [endWorking, {loading: endLoading, error: endError}] =
    useMutation(END_WORKING_MUTATION);
  const [updateWorking, {loading: updateLoading}] = useMutation(
    UPDATE_WORKING_MUTATION,
  );

  useEffect(() => {
    if (loading) return;
    if (data && data.working_shift.length > 0) {
      setWorking(true);
      const item = data.working_shift[0];
      setShiftID(item.id);
    }
  }, [data, loading]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (shiftID > -1 && !loading && data && data.working_shift.length > 0) {
        const start = dayjs(data.working_shift[0].start);
        setShiftDuration(hhmmDuration(start, dayjs()));
      }
    }, 1000);
    // clearing interval
    return () => clearInterval(timer);
  });

  useEffect(() => {
    if (isWorking) {
      activateKeepAwake();
    } else {
      deactivateKeepAwake();
    }
  }, [isWorking]);

  useEffect(async () => {
    if (!geo) return;
    if (geo.error) return;
    if (!geo.lastPosition) return;
    const {coords, timestamp} = geo.lastPosition;
    if (!coords) return;
    // if (timestamp > lastGeoTimestamp) {
    // TODO: update last coords to working-shift
    setLastGeoTimestamp(timestamp);
    console.log('new geo: ', shiftID, timestamp);
    if (shiftID && !updateLoading) {
      console.log('coords: ', coords);
      const variables = {
        ID: shiftID,
        point: {
          type: 'Point',
          coordinates: [coords.longitude, coords.latitude],
        },
        timestamp: dayjs(timestamp).format(),
      };
      const resUpdate = await updateWorking({variables});
    }
    // }
  }, [geo]);

  return (
    <View style={styles.container}>
      <GeoLocationProvider isActive={isWorking} handleGeoInfo={setGeo} />
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          //Alert.alert('Modal has been closed.');
        }}>
        <View style={modelStyles.centeredView}>
          <View style={modelStyles.modalView}>
            <View style={modelStyles.closeButton}>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                }}>
                <Icon
                  raised
                  name="ios-close"
                  type="ionicon"
                  containerStyle={{backgroundColor: '#000000'}}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.colFlex}>
              <TouchableOpacity
                onPress={async () => {
                  const variables = {vehicleID: 1};
                  const res = await startWorking({variables});
                  const {id} = res.data.insert_working_shift_one;
                  setShiftID(id);
                  setWorking(true);
                  setModalVisible(!modalVisible);
                }}>
                <SvgXml xml={SsvModel1} width="150" height="150" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  const variables = {vehicleID: 2};
                  const res = await startWorking({variables});
                  const {id} = res.data.insert_working_shift_one;
                  setShiftID(id);
                  setWorking(true);
                  setModalVisible(!modalVisible);
                }}>
                <SvgXml xml={SsvModel2} width="150" height="150" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  const variables = {vehicleID: 3};
                  const res = await startWorking({variables});
                  const {id} = res.data.insert_working_shift_one;
                  setShiftID(id);
                  setWorking(true);
                  setModalVisible(!modalVisible);
                }}>
                <SvgXml xml={SsvModel3} width="150" height="150" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {!isWorking && (
        <View
          style={[
            styles.rowFlex,
            {
              width: '100%',
              justifyContent: 'flex-end',
              alignContent: 'stretch',
            },
          ]}>
          <View style={styles.inputContainer}>
            <TouchableOpacity
              style={{
                backgroundColor: '#15c146',
                height: 55,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => {
                // const variables = {vehicleID: 1};
                // const res = await startWorking({variables});
                // const {id} = res.data.insert_working_shift_one;
                // setShiftID(id);
                // setWorking(true);
                setModalVisible(!modalVisible);
              }}>
              <Text>{t('job.WorkingInitButtonLabel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {isWorking && shiftID > -1 && (
        <>
          <Text style={styles.timer}>
            [#{getVehicleID(data)}] {shiftDuration}
          </Text>
          <Icon
            raised
            name="pause-outline"
            type="ionicon"
            containerStyle={{backgroundColor: '#000000'}}
            onPress={async () => {
              const variables = {
                ID: shiftID,
                timestamp: dayjs().format(),
              };
              const res = await endWorking({variables});
              setShiftID(-1);
              setShiftDuration('');
              setWorking(false);
            }}
          />
        </>
      )}
      <View style={{width: 10}} />
    </View>
  );
}
``;

const ACTIVE_WORKING_SHIFT = gql`
  subscription ACTIVE_WORKING_SHIFT($userId: uuid!) {
    working_shift(where: {user_id: {_eq: $userId}, end: {_is_null: true}}) {
      id
      start
      vehicle_id
    }
  }
`;

const START_WORKING_MUTATION = gql`
  mutation START_WORKING_MUTATION($vehicleID: Int) {
    insert_working_shift_one(object: {vehicle_id: $vehicleID}) {
      id
    }
  }
`;

const UPDATE_WORKING_MUTATION = gql`
  mutation UPDATE_WORKING_MUTATION(
    $ID: bigint!
    $point: geometry!
    $timestamp: timestamptz!
  ) {
    update_working_shift_by_pk(
      pk_columns: {id: $ID}
      _set: {point: $point, latest_timestamp: $timestamp}
    ) {
      id
    }
  }
`;

const END_WORKING_MUTATION = gql`
  mutation END_WORKING_MUTATION($ID: bigint!, $timestamp: timestamptz!) {
    update_working_shift_by_pk(pk_columns: {id: $ID}, _set: {end: $timestamp}) {
      id
    }
  }
`;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  colFlex: {
    flexDirection: 'column',
  },
  rowFlex: {
    flexDirection: 'row',
  },
  inputContainer: {
    flexGrow: 1,
  },
  input: {
    height: 40,
    paddingHorizontal: 5,
  },
  searchModeButton: {
    flex: 1,
    width: 50,
    justifyContent: 'space-around',
  },
  filtered: {
    borderRadius: 5,
    backgroundColor: YELLOW,
    paddingVertical: 4,
    paddingEnd: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timer: {
    borderRadius: 10,
    backgroundColor: GREEN,
    paddingVertical: 4,
    paddingHorizontal: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'right',
  },
});
