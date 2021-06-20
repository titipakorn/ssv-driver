import React, {useEffect, useRef, useState} from 'react';
import Geolocation from '@react-native-community/geolocation';

export default function GeoLocationProvider({handleGeoInfo, isActive = false}) {
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
        // console.log('last position: ', typeof lastPosition, lastPosition);
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
