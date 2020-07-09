import React from 'react';
import {StyleSheet} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import MapView, {Marker} from 'react-native-maps';
import bbox from '@turf/bbox';
import {lineString} from '@turf/helpers';

function pushGeoPosition2Logger(position) {
  console.log('2logger:', position);
}

function mapbound(curr, ODpins) {
  let arr = [];
  let region = {
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0,
    longitudeDelta: 0,
  };
  if (curr && curr.latitude) {
    arr.push([curr.longitude, curr.latitude]);
  }
  Object.keys(ODpins).map(k => {
    const one = ODpins[k];
    if (one.latitude) {
      arr.push([one.longitude, one.latitude]);
    }
  });
  if (arr.length < 2) return null;
  const line = lineString(arr);
  const mbox = bbox(line);
  const latDelta = mbox[3] - mbox[1];
  const lonDelta = mbox[2] - mbox[0];
  region = {
    latitude: (mbox[3] + mbox[1]) / 2,
    longitude: (mbox[2] + mbox[0]) / 2,
    latitudeDelta: latDelta * 1.5,
    longitudeDelta: lonDelta * 1.5,
  };
  return region;
  /*
  type Region {
    latitude: Number,
    longitude: Number,
    latitudeDelta: Number,
    longitudeDelta: Number,
  }
  */
  return null;
}

export default function Map(props) {
  let mapHandler = React.useRef(null);
  let watchID = React.useRef(null);
  const [region, setRegion] = React.useState({
    latitude: 13.7385,
    longitude: 100.5706,
    latitudeDelta: 0.0122,
    longitudeDelta: 0.0121,
  });
  const [log, setLog] = React.useState([]);
  const [geo, setGeo] = React.useState({
    initialPosition: 'unknown',
    lastPosition: 'unknown',
  });
  const {pins} = props;

  React.useEffect(() => {
    // Fetch the token from storage then navigate to our appropriate place
    const bootstrapAsync = () => {
      Geolocation.getCurrentPosition(
        position => {
          const initialPosition = position;
          setGeo({initialPosition, lastPosition: initialPosition});
          pushGeoPosition2Logger(position, setLog);
        },
        error => {
          console.log('error: ', JSON.stringify(error));
          // Alert.alert('Error', JSON.stringify(error))
        },
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
      );
      watchID = Geolocation.watchPosition(position => {
        const lastPosition = position;
        console.log('last position: ', typeof lastPosition, lastPosition);
        setGeo({...geo, lastPosition});
        pushGeoPosition2Logger(position, position);
      });
    };
    bootstrapAsync(pins);

    return () => {
      if (watchID != null) {
        Geolocation.clearWatch(watchID);
      }
    };
  }, []);

  React.useEffect(() => {
    const mb = mapbound(geo.lastPosition.coords, pins);
    if (mb) mapHandler.animateToRegion(mb, 500);
  }, [pins, geo]);

  return (
    <MapView
      style={styles.map}
      initialRegion={region}
      ref={map => {
        mapHandler = map;
      }}>
      {Object.keys(pins).map(k => {
        if (pins[k].latitude) {
          return (
            <Marker
              key={`p-${k}`}
              pinColor={k === 'origin' ? 'red' : 'green'}
              title={pins[k].title}
              description={k}
              coordinate={pins[k]}
            />
          );
        }
      })}
      {geo.lastPosition !== 'unknown' && (
        <Marker
          key={'pin-you'}
          title={'You'}
          pinColor={'blue'}
          description={'Your current position'}
          coordinate={geo.lastPosition.coords}
        />
      )}
    </MapView>
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
});
