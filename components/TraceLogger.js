import React from 'react';
import dayjs from 'dayjs';
import gql from 'graphql-tag';
import {useMutation} from '@apollo/react-hooks';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';

export default function TraceLogger({tripID, tripState, position}) {
  const [hasUploaded, setUploaded] = React.useState(false);
  const [log, setLog] = React.useState([]);
  const [tmsp, setTmsp] = React.useState(null);
  const [processing, setProcessing] = React.useState(false);

  const [insertTraces, {loading, error}] = useMutation(INSERT_TRACES);

  React.useEffect(() => {
    return () => {
      if (log.length > 0) {
        upload(insertTraces, setProcessing, log);
      }
    };
  }, []);

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (log.length === 0) return;
      if (!hasUploaded) {
        // first one will be uploaded w/o any wait
        upload(insertTraces, setProcessing, log);
        setLog([]);
        setUploaded(true);
        return;
      }
      const duration = (dayjs() - dayjs(log[0].timestamp)) / 1000;
      if (duration > 60 || log.length > 20 || tripState === 'done') {
        console.log('send data', log, 'to Server');
        upload(insertTraces, setProcessing, log);
        setLog([]);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [log]);

  React.useEffect(() => {
    // Don't log anything incomplete
    /* STEP:
    X 1. wait
    / 2. accept
    / 3. onboard
    X 4. done [wait for feedback]
    X 5. over
    */
    if (tripID == undefined) {
      return;
    }
    if (tripState == undefined) return;
    if (position === 'unknown') return;
    if (tripState === 'wait') return;
    if (tripState === 'done' && log.length == 0) return;

    const {coords, timestamp} = position;
    const item = {
      trip_id: tripID,
      trip_state: tripState,
      timestamp: dayjs(timestamp).format('YYYY-MM-DDTHH:mm:ssZ'),
      accuracy: coords.accuracy,
      altitude: coords.altitude,
      heading: coords.heading,
      speed: coords.speed,
      point: {type: 'Point', coordinates: [coords.longitude, coords.latitude]},
    };

    const updatedLog = timestamp > tmsp ? [...log, item] : log;
    // update timestamp
    setTmsp(timestamp);
    setLog(updatedLog);
    console.log('updateLog data', updatedLog, 'to Server');
  }, [position, tripState]);

  if (error) {
    console.log('tracelogger: err: ', error);
  }

  return (
    <View>
      <Text style={styles.overlay}>
        {hasUploaded && '..'}
        {log.length}
      </Text>
      {loading && processing && <ActivityIndicator />}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    padding: 5,
    color: '#777',
  },
});

const INSERT_TRACES = gql`
  mutation INSERT_TRACES($objs: [trace_insert_input!]!) {
    insert_trace(
      objects: $objs
      on_conflict: {
        constraint: trace_trip_id_timestamp_key
        update_columns: [accuracy, point, speed]
      }
    ) {
      affected_rows
    }
  }
`;

async function upload(fn, fnLoading, objs) {
  fnLoading(true);
  const variables = {objs};
  await fn({
    variables,
  });
  fnLoading(false);
}
