import {useMutation} from '@apollo/react-hooks';
import gql from 'graphql-tag';
import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Icon} from 'react-native-elements';
import {TouchableOpacity} from 'react-native-gesture-handler';

const YELLOW = 'rgba(252, 186, 3, 0.5)';
const RED = 'rgba(249, 88, 67, 0.5)';

export default function JobOverlay({isWorking, setWorking}) {
  const [shiftID, setShiftID] = useState(localStorage.getItem('shiftID'));
  const [
    startWorking,
    {loading: startLoading, error: startError},
  ] = useMutation(START_WORKING_MUTATION);
  const [endWorking, {loading: endLoading, error: endError}] = useMutation(
    END_WORKING_MUTATION,
  );
  const [
    updateWorking,
    {loading: updateLoading, error: updateError},
  ] = useMutation(UPDATE_WORKING_MUTATION);

  console.log('shiftID: ', shiftID);
  return (
    <View style={styles.container}>
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
              onPress={async () => {
                const res = await startWorking({vehicleID: 1});
                console.log('start working: ', res);
                setWorking(true);
              }}>
              <Text>Start working</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {isWorking && (
        <Icon
          raised
          name="pause-outline"
          type="ionicon"
          containerStyle={{backgroundColor: '#000000'}}
          onPress={async () => {
            const variables = {
              ID: shiftID,
            };
            const res = await endWorking({variables});
            console.log('end working: ', res);
            setWorking(false);
          }}
        />
      )}
      <View style={{width: 10}} />
    </View>
  );
}
``;
const START_WORKING_MUTATION = gql`
  mutation START_WORKING_MUTATION($vehicleID: Int) {
    insert_working_shift_one(object: {vehicle_id: $vehicleID}) {
      id
    }
  }
`;

const UPDATE_WORKING_MUTATION = gql`
  mutation UPDATE_WORKING_MUTATION($ID: bigint!, $point: geometry!, $timestamp: timestamptz!) {
  update_working_shift_by_pk(
    pk_columns: {id: $ID},
    _set: {point: $point, latest_timestamp: $timestamp}) {
    id
  }
`;

const END_WORKING_MUTATION = gql`
  mutation END_WORKING_MUTATION($ID: bigint!, $timestamp: timestamptz!) {
  update_working_shift_by_pk(
    pk_columns: {id: $ID},
    _set: {end: $timestamp}) {
    id
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
});
