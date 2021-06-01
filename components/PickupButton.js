import React from 'react';
import {
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  TouchableHighlight,
  View,
  Text,
} from 'react-native';
import gql from 'graphql-tag';
import {useMutation} from '@apollo/react-hooks';
import Icon from 'react-native-vector-icons/Ionicons';
import {modelStyles} from './Modal';

const PICKUP_TASK_MUTATION = gql`
  mutation PICKUP_TASK_MUTATION($jobID: Int!, $now: timestamptz!) {
    update_trip(where: {id: {_eq: $jobID}}, _set: {picked_up_at: $now}) {
      affected_rows
      returning {
        id
        picked_up_at
      }
    }
  }
`;

export default function PickupButton({jobID}) {
  let handler = React.useRef(null);
  const [image, setImage] = React.useState(null);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);
  const [pickup, {loading, error}] = useMutation(PICKUP_TASK_MUTATION);
  // refetch should not be ncessary since it's subscription thing
  let buttontext = (
    <Text
      style={[
        {
          color: 'white',
          fontSize: 36,
        },
      ]}>
      PICK UP
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

  const pickSingle = (cropit, circular = false, mediaType) => {
    ImagePicker.openPicker({
      width: 500,
      height: 500,
      cropping: cropit,
      cropperCircleOverlay: circular,
      sortOrder: 'none',
      compressImageMaxWidth: 1000,
      compressImageMaxHeight: 1000,
      compressImageQuality: 1,
      compressVideoPreset: 'MediumQuality',
      includeExif: true,
      cropperStatusBarColor: 'white',
      cropperToolbarColor: 'white',
      cropperActiveWidgetColor: 'white',
      cropperToolbarWidgetColor: '#3498DB',
    })
      .then(image => {
        console.log('received image', image);
        setImage({
          uri: image.path,
          width: image.width,
          height: image.height,
          mime: image.mime,
        });
      })
      .catch(e => {
        console.log(e);
        Alert.alert(e.message ? e.message : e);
      });
  };

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
          Alert.alert('Modal has been closed.');
        }}>
        <View style={modelStyles.centeredView}>
          <View style={modelStyles.modalView}>
            <View style={modelStyles.closeButton}>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                }}>
                <Icon name="ios-close" size={50} color={'#aaa'} />
              </TouchableOpacity>
            </View>
            <Text style={modelStyles.modalTitle}>Pick up your customer?</Text>
            <TouchableHighlight
              style={{
                ...modelStyles.openButton,
                marginTop: 30,
                backgroundColor: '#2196F3',
              }}
              onPress={() => pickSingle(true)}>
              <Text style={modelStyles.textStyle}>Camera</Text>
            </TouchableHighlight>
            <TouchableHighlight
              style={{
                ...modelStyles.openButton,
                marginTop: 30,
                backgroundColor: '#2196F3',
              }}
              onPress={() => {
                setProcessing(true);
                const variables = {
                  jobID,
                  now: new Date(),
                };
                pickup({
                  variables,
                })
                  .then(res => {
                    // console.log('done: accepting job', res);
                    // console.log(res.data.update_trip.returning);
                  })
                  .catch(err => {
                    // console.log('err: ', err);
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
          setModalVisible(!modalVisible);
        }}>
        {buttontext}
      </TouchableOpacity>
    </>
  );
}
