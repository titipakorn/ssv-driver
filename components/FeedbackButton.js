import React from 'react';
import { ActivityIndicator, Modal, TouchableHighlight, TouchableOpacity, StyleSheet, Text, View } from 'react-native';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import { AirbnbRating } from 'react-native-ratings';
import { JOB_HISTORY_QUERY } from './JobHistory'
import Icon from 'react-native-vector-icons/Ionicons';
import { modelStyles } from './Modal'

const UPDATE_FEEDBACK_MUTATION = gql`
  mutation UPDATE_FEEDBACK_MUTATION($jobID: Int!, $rating: smallint!) {
    update_trip(where: {id: {_eq: $jobID}}, _set: {driver_feedback: $rating}) {
      affected_rows
    }
  }
`;
// TODO: implement this feedback feature
export default function FeedbackButton({ jobID, userID }) {
  const [rating, setRating] = React.useState(3)
  const [modalVisible, setModalVisible] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);
  const [update_feedack, { loading, error }] = useMutation(UPDATE_FEEDBACK_MUTATION, {
    refetchQueries: [
      {
        query: JOB_HISTORY_QUERY,
        variables: { userId: userID }
      }
    ]
  });
  // refetch should not be ncessary since it's subscription thing
  let buttontext = (
    <Text
      style={[
        {
          color: 'white',
          fontSize: 36,
        },
      ]}>
      FEEDBACK
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
    if (!loading && processing) {
      setTimeout(() => {
        setProcessing(false);
      }, 300);
    }
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
            <Text style={modelStyles.modalText}>Your feedback is valuable to us</Text>

            <AirbnbRating
              count={5}
              reviews={["Bad", "Meh", "OK", "Good", "Excellent"]}
              startingValue={rating}
              size={30}
              onFinishRating={v => {
                setRating(v)
              }}
            />

            <TouchableHighlight
              style={{ ...modelStyles.openButton, marginTop: 30, backgroundColor: "#2196F3" }}
              onPress={() => {
                setModalVisible(!modalVisible);
                const variables = {
                  jobID,
                  rating,
                };
                // console.log('press: feedback driver', variables);
                update_feedack({
                  variables,
                })
                  .then(res => {
                    // console.log('done: feedback driver', res);
                    // console.log(res.data.update_trip.returning);
                  })
                  .catch(err => {
                    console.log('err: ', err);
                  })
              }}
            >
              <Text style={modelStyles.textStyle}>Submit</Text>
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


const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  closeButton: {
    width: '100%',
    padding: 0,
    display: 'flex',
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  openButton: {
    backgroundColor: "#F194FF",
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  }
});