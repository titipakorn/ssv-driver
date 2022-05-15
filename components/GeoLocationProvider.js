import React, {useEffect, useRef, useState} from 'react';
import Geolocation from '@react-native-community/geolocation';
const faye = require('faye');
var client = new faye.Client('https://ssv-one.10z.dev/faye/faye');

export default function GeoLocationProvider({
  user,
  handleGeoInfo,
  isActive = false,
}) {
  let watchID = useRef(null);
  const [geo, setGeo] = useState({
    initialPosition: 'unknown',
    lastPosition: 'unknown',
    error: null,
  });

  useEffect(() => {
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
          client.publish('/driver_locations', {
            driver: user,
            coords: position.coords,
            timestamp: position.timestamp,
          });
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
        client.publish('/driver_locations', {
          driver: user,
          coords: position.coords,
          timestamp: position.timestamp,
        });
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
