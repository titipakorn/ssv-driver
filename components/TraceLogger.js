import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import dayjs from 'dayjs';

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
  // console.log('[UL] ===> ', objs.length);
  fnLoading(true);
  const variables = {
    objs,
  };
  // console.log('[UL]: uploadTraces', variables);
  const res = await fn({
    variables,
  });
  // console.log('[UL]:  result: ', res);
  fnLoading(false);

  // .then(res => {
  //   // console.log('done: accepting job', res);
  //   // console.log(res.data.update_trip.returning);
  // })
  // .catch(err => {
  //   // console.log('err: ', err);
  // })
  // .finally(() => {
  //   // console.log('finally');
  // });
}

export default function TraceLogger({ tripID, tripState, position }) {
  const [hasUploaded, setUploaded] = React.useState(false)
  const [log, setLog] = React.useState([]);
  const [tmsp, setTmsp] = React.useState(null);
  const [processing, setProcessing] = React.useState(false);
  const [insertTraces, { loading, error }] = useMutation(INSERT_TRACES);

  React.useEffect(() => {
    return () => {
      if (log.length > 0) {
        upload(insertTraces, setProcessing, log);
      }
    };
  }, []);

  React.useEffect(() => {
    // console.log('log changed');
    if (log.length === 0) return;
    if (!hasUploaded) {
      // first one will be uploaded w/o any wait
      upload(insertTraces, setProcessing, log);
      setLog([]);
      setUploaded(true);
      return
    }

    const duration = (dayjs() - dayjs(log[0].timestamp)) / 1000;
    // console.log(
    //   '  >> duration ',
    //   duration,
    //   '|log#',
    //   log.length,
    //   ' state: ',
    //   tripState,
    // );
    if (duration > 60 || log.length > 20 || tripState === 'done') {
      upload(insertTraces, setProcessing, log);
      setLog([]);
    }
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
    if (tripID == undefined) return;
    if (tripState == undefined) return;
    if (position === 'unknown') return;
    if (tripState === 'wait') return;
    if (tripState === 'done' && log.length == 0) return;

    const { coords, timestamp } = position;
    const item = {
      trip_id: tripID,
      trip_state: tripState,
      timestamp: dayjs(timestamp).format('YYYY-MM-DDTHH:mm:ssZ'),
      accuracy: coords.accuracy,
      altitude: coords.altitude,
      heading: coords.heading,
      speed: coords.speed,
      point: { type: 'Point', coordinates: [coords.longitude, coords.latitude] },
    };

    const updatedLog = timestamp > tmsp ? [...log, item] : log;
    // update timestamp
    setTmsp(timestamp);
    setLog(updatedLog);
  }, [position, tripState]);

  if (error) {
    console.log('tracelogger: err: ', error);
  }

  return (
    <View>
      <Text style={styles.overlay}>{hasUploaded && '..'}{log.length}</Text>
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
