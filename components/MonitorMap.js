import React, {useEffect, useState} from 'react';
import {StyleSheet, FlatList, Text, View} from 'react-native';
import gql from 'graphql-tag';
import MapView, {Marker} from 'react-native-maps';
const faye = require('faye');
import dayjs from 'dayjs';
var client = new faye.Client('https://ssv-one.10z.dev/faye/faye');
import {useSubscription} from '@apollo/react-hooks';
import {Icon} from 'react-native-elements';

async function getLastestLocation(driver) {
  const resp = await fetch('https://ssv-one.10z.dev/v1/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `queryGetLastLocation($driver: String){
          log_traces(limit: 1,
          order_by: {
            timestamp: desc
          },
          where: {
            driver_name: {
              _eq: $driver
            }
          }){
            point,
            timestamp
          }
        }`,
      variables: {
        driver,
      },
    }),
  });
  const json = await resp.json();
  return json;
}

export default function Map() {
  const [drivers, setDriver] = useState({});
  const [locationDrivers, setLocationDriver] = useState({});
  const [driverState, setDriverState] = useState({});
  const [region] = React.useState({
    latitude: 13.7385,
    longitude: 100.5706,
    latitudeDelta: 0.0222,
    longitudeDelta: 0.0221,
  });
  const {data} = useSubscription(ACTIVE_WORKING_SHIFT, {
    shouldResubscribe: true,
    variables: {day: dayjs().startOf('day').format('YYYY-MM-DDTHH:mm:ssZ')},
  });
  const {data: activeTrips} = useSubscription(ACTIVE_TRIPS);

  useEffect(() => {
    if (data) {
      const dState = Object.fromEntries(
        data.items.map((item) => {
          return [item?.driver?.username, item?.vehicle?.color];
        }),
      );
      async function fetchData() {
        const ddStates = Object.fromEntries(
          await Promise.all(
            Object.keys(dState).map(async (item) => {
              const locationData = await getLastestLocation(item);
              const [locationPoint] = locationData?.data?.log_traces ?? [];
              return [
                item,
                {
                  latitude: locationPoint?.point?.coordinates[1] ?? 0,
                  longitude: locationPoint?.point?.coordinates[0] ?? 0,
                  timestamp: locationPoint?.timestamp,
                },
              ];
            }),
          ),
        );
        setLocationDriver(ddStates);
      }
      fetchData();
      setDriverState(dState);
    }
  }, [data]);
  useEffect(() => {
    client.subscribe(`/driver_locations`, function (message) {
      const {
        driver,
        coords: {latitude, longitude},
        timestamp,
      } = message;
      setDriver({driver, latitude, longitude, timestamp});
    });
  }, []);
  useEffect(() => {
    if ('driver' in drivers) {
      const {driver, latitude, longitude, timestamp} = drivers;
      setLocationDriver({
        ...locationDrivers,
        [driver]: {latitude, longitude, timestamp},
      });
    }
  }, [drivers]);
  return (
    <>
      <View style={{flex: 1}}>
        <View style={{flex: 0.08, padding: 1}}>
          <FlatList
            horizontal={true}
            data={data ? data?.items : []}
            renderItem={({item}) => {
              return (
                <View
                  style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                  <Icon
                    reverse
                    size={12}
                    name="car-outline"
                    color={item?.vehicle?.color}
                    type="ionicon"
                  />
                  <Text
                    style={{
                      borderWidth: 1,
                      borderStyle: 'solid',
                      borderRadius: 5,
                      borderColor: 'black',
                      padding: 1,
                      color: 'white',
                      backgroundColor: activeTrips
                        ? activeTrips?.trip.filter(
                            (v) =>
                              v.driver?.username === item?.driver?.username,
                          ).length > 0
                          ? 'red'
                          : 'green'
                        : 'blue',
                    }}>
                    {item?.driver?.username}
                  </Text>
                </View>
              );
            }}
            keyExtractor={(item) => item?.driver?.username}
          />
        </View>
        <View style={{flex: 0.92}}>
          <MapView style={styles.map} initialRegion={region}>
            <Marker
              key={'start_location'}
              coordinate={{
                longitude: 100.60224141285296,
                latitude: 14.07353618595782,
              }}
              // color={'#006400'}
            >
              <Icon
                reverse
                size={12}
                name="home-outline"
                color={'#006400'}
                type="ionicon"
              />
            </Marker>
            {Object.keys(locationDrivers).map(
              (v) =>
                driverState[v] && (
                  <Marker
                    key={`marker_${v}`}
                    coordinate={{
                      longitude: locationDrivers[v]?.longitude ?? 0,
                      latitude: locationDrivers[v]?.latitude ?? 0,
                    }}>
                    <Icon
                      reverse
                      size={12}
                      name="car-outline"
                      color={driverState[v] ?? '#00008b'}
                      type="ionicon"
                    />
                  </Marker>
                ),
            )}
          </MapView>
        </View>
      </View>
    </>
  );
}
const ACTIVE_WORKING_SHIFT = gql`
  subscription ACTIVE_WORKING_SHIFT($day: timestamptz) {
    items: working_shift(
      distinct_on: [user_id]
      where: {_and: [{_or: [{start: {_gte: $day}}]}, {end: {_is_null: true}}]}
    ) {
      id
      start
      latest_timestamp
      vehicle {
        name
        license_plate
        color
      }
      driver {
        username
      }
    }
  }
`;

const ACTIVE_TRIPS = gql`
  subscription ACTIVE_TRIPS {
    trip(
      distinct_on: [driver_id]
      where: {
        _and: [
          {driver_id: {_is_null: false}}
          {dropped_off_at: {_is_null: true}}
          {cancelled_at: {_is_null: true}}
        ]
      }
      order_by: {driver_id: asc, reserved_at: desc}
    ) {
      driver {
        username
      }
    }
  }
`;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
  },
  map: {
    height: '100%',
    width: '100%',
    marginVertical: 0,
  },
});
