import React, {useEffect, useRef, useState} from 'react';
import Geolocation from '@react-native-community/geolocation';
import gql from 'graphql-tag';
import {useMutation} from '@apollo/react-hooks';
import {useRecoilValue} from 'recoil';
import {OccupiedState, workingJobID} from '../libs/atom';
const faye = require('faye');
var client = new faye.Client('https://ssv-one.10z.dev/faye/faye');

export default function GeoLocationProvider({
  user,
  handleGeoInfo,
  isActive = false,
}) {
  const [addLog, {loading, error}] = useMutation(ADD_LOG_TRACES);
  const occupied = useRecoilValue(OccupiedState);
  const jobID = useRecoilValue(workingJobID);
  let watchID = useRef(null);
  const [geo, setGeo] = useState({
    initialPosition: 'unknown',
    lastPosition: 'unknown',
    error: null,
  });
  useEffect(() => {
    const {lastPosition: position} = geo;
    if (typeof position === 'object') {
      client.publish('/driver_locations', {
        driver: user,
        coords: position.coords,
        timestamp: position.timestamp,
      });
      const variables = {
        driver_name: user,
        jobID,
        timestamp: new Date(),
        occupied,
        point: {
          type: 'Point',
          coordinates: [position.coords.longitude, position.coords.latitude],
        },
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        heading: position.coords.heading,
        speed: position.coords.speed,
      };
      addLog({variables})
        .then((_) => {
          // console.log('done: accepting job', res);
          // console.log(res.data.update_trip.returning);
        })
        .catch((err) => {
          console.log('err: ', err);
        });
    }
    // automatically push if func is availabel
    if (handleGeoInfo) handleGeoInfo(geo);
  }, [geo]);

  useEffect(() => {
    // Fetch the token from storage then navigate to our appropriate place
    const bootstrapAsync = () => {
      Geolocation.getCurrentPosition(
        (position) => {
          console.log('new position: ', position);
          const initialPosition = position;
          const x = {
            initialPosition,
            lastPosition: initialPosition,
            error: null,
          };
          setGeo(x);
        },
        (error) => {
          console.log('error: ', JSON.stringify(error));
          // Alert.alert('Error', JSON.stringify(error))
          const x = {...geo, error};
          setGeo(x);
        },
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
      );
      watchID = Geolocation.watchPosition((position) => {
        const lastPosition = position;
        console.log('last position: ', typeof lastPosition, lastPosition);
        const x = {...geo, lastPosition};
        setGeo(x);
      });
    };

    if (isActive) bootstrapAsync();

    return () => {
      if (watchID !== null) {
        Geolocation.clearWatch(watchID);
      }
    };
  }, [isActive]);

  return <></>;
}

const ADD_LOG_TRACES = gql`
  mutation LOG_TRACE_MUTATION(
    $driver_name: String
    $jobID: Int
    $altitude: numeric
    $speed: numeric
    $timestamp: timestamptz
    $point: geometry
    $accuracy: numeric
    $heading: numeric
    $occupied: Boolean
  ) {
    insert_log_traces_one(
      object: {
        driver_name: $driver_name
        job_id: $jobID
        altitude: $altitude
        speed: $speed
        timestamp: $timestamp
        point: $point
        occupied: $occupied
        accuracy: $accuracy
        heading: $heading
      }
    ) {
      job_id
    }
  }
`;
