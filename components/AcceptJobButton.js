import React from 'react';
import { ActivityIndicator, Modal, TouchableOpacity, TouchableHighlight, View, StyleSheet, Text } from 'react-native';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import Icon from 'react-native-vector-icons/Ionicons';
import { modelStyles } from './Modal'

const ACCEPT_JOB_MUTATION = gql`
  mutation ACCEPT_JOB_MUTATION(
    $jobID: Int!
    $userID: uuid!
    $now: timestamptz!
  ) {
    update_trip(
      where: {id: {_eq: $jobID}}
      _set: {driver_id: $userID, accepted_at: $now}
    ) {
      affected_rows
      returning {
        id
        driver {
          username
        }
        accepted_at
      }
    }
  }
`;

export default function AccepJobButton({ jobID, userID }) {
  let handler = React.useRef(null);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);
  const [accept_job, { loading, error }] = useMutation(ACCEPT_JOB_MUTATION);
  // refetch should not be ncessary since it's subscription thing
  let buttontext = (
    <Text
      style={[
        {
          color: 'white',
          fontSize: 36,
        },
      ]}>
      START
    </Text>
  );
  if (loading) {
    buttontext = <ActivityIndicator />;
  } else if (error) {
    buttontext = (
      <Text
        style={[
          {
            color: 'white',
            fontSize: 20,
          },
        ]}>
        {error.message}
      </Text>
    );
  }

  React.useEffect(() => {
    if (handler) clearTimeout(handler);
    if (!loading && processing) {
      handler = setTimeout(() => {
        setProcessing(false);
      }, 300);
    }
    return () => clearTimeout(handler);
  }, [loading]);

  return (
    <>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
        }}
      >
        <View style={modelStyles.centeredView}>
          <View style={modelStyles.modalView}>
            <View style={modelStyles.closeButton} >
              <TouchableOpacity
                onPress={() => { setModalVisible(false) }}
              >
                <Icon name="ios-close" size={50} color={"#aaa"} />
              </TouchableOpacity>
            </View>
            <Text style={modelStyles.modalTitle}>Accept the job?</Text>
            <TouchableHighlight
              style={{ ...modelStyles.openButton, marginTop: 30, backgroundColor: "#2196F3" }}
              onPress={() => {
                const variables = {
                  jobID,
                  userID,
                  now: new Date(),
                };
                // console.log('press: accepting job', variables);
                accept_job({
                  variables,
                })
                  .then(res => {
                    // console.log('done: accepting job', res);
                    // console.log(res.data.update_trip.returning);
                  })
                  .catch(err => {
                    console.log('err: ', err);
                  });
              }}>
              <Text style={modelStyles.textStyle}>Confirm</Text>
            </TouchableHighlight>
          </View>
        </View>
      </Modal>
      <TouchableOpacity
        style={{
          backgroundColor: error ? '#f43030' : '#15c146',
          height: 55,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        disabled={processing || loading || error}
        onPress={() => {
          setModalVisible(!modalVisible)
        }}>
        {buttontext}
      </TouchableOpacity>
    </>
  );
}
