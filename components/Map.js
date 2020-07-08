import React from 'react';
import {StyleSheet} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import MapView, {Marker} from 'react-native-maps';

function pushGeoPosition2Logger(position) {
  console.log('2logger:', position)
}

export default function Map(props) {
  let watchID = React.useRef(null);
  const [log, setLog] = React.useState([]);
  const [geo, setGeo] = React.useState({
    initialPosition: 'unknown',
    lastPosition: 'unknown',
  });
  const {pins} = props;

  React.useEffect(() => {
    // Fetch the token from storage then navigate to our appropriate place
    const bootstrapAsync = async () => {
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
    bootstrapAsync();

    return () => {
      if (watchID != null) {
        Geolocation.clearWatch(watchID);
      }
    };
  }, []);

  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: 13.7385,
        longitude: 100.5706,
        latitudeDelta: 0.0122,
        longitudeDelta: 0.0121,
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
