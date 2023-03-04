import React from 'react';
import {
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  TouchableHighlight,
  View,
  StyleSheet,
  Text,
} from 'react-native';
import gql from 'graphql-tag';
import {useMutation} from '@apollo/react-hooks';
import Icon from 'react-native-vector-icons/Ionicons';
import {modelStyles} from './Modal';
import {useTranslation} from 'react-i18next';
import {useRecoilState} from 'recoil';
import {workingJobID, isSharing} from '../libs/atom';

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

const ACCEPT_SHARED_JOB_MUTATION = gql`
  mutation ACCEPT_JOB_MUTATION(
    $jobID: Int!
    $userID: uuid!
    $parentJobID: Int!
    $now: timestamptz!
  ) {
    update_trip(
      where: {id: {_eq: $jobID}}
      _set: {
        driver_id: $userID
        accepted_at: $now
        parent_trip_id: $parentJobID
      }
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

export default function AcceptJobButton({jobID, userID, isShared}) {
  let handler = React.useRef(null);
  const {t} = useTranslation();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);
  const [accept_job, {loading, error}] = useMutation(ACCEPT_JOB_MUTATION);
  const [accept_shared_job, {loading: sLoading, error: sError}] = useMutation(
    ACCEPT_SHARED_JOB_MUTATION,
  );
  const [jobList, setWorkingJobID] = useRecoilState(workingJobID);
  const [jobSharing, setSharing] = useRecoilState(isSharing);
  // refetch should not be ncessary since it's subscription thing
  let buttontext = (
    <Text
      style={[
        {
          color: 'white',
          fontSize: 36,
        },
      ]}>
      {t('job.StartButtonLabel')}
    </Text>
  );
  if (loading || sLoading) {
    buttontext = <ActivityIndicator />;
  } else if (error || sError) {
    buttontext = (
      <Text
        style={[
          {
            color: 'white',
            fontSize: 20,
          },
        ]}>
        {error?.message}
        {sError?.message}
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
          //Alert.alert('Modal has been closed.');
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
            <Text style={modelStyles.modalTitle}>
              {t('job.AcceptJobQuestion')}
            </Text>
            <TouchableHighlight
              style={{
                ...modelStyles.openButton,
                marginTop: 30,
                backgroundColor: '#2196F3',
              }}
              onPress={() => {
                if (isShared) {
                  if (jobList.length > 0) {
                    if (jobSharing[0]) {
                      const variables = {
                        jobID,
                        userID,
                        parentJobID: jobList[0],
                        now: new Date(),
                      };
                      return accept_shared_job({
                        variables,
                      });
                    }
                  }
                }
                const variables = {
                  jobID,
                  userID,
                  now: new Date(),
                };
                accept_job({
                  variables,
                })
                  .then((_) => {
                    setWorkingJobID([...jobList, jobID]);
                    setSharing([...jobSharing, isShared]);
                  })
                  .catch((err) => {
                    console.log('err: ', err);
                  });
              }}>
              <Text style={modelStyles.textStyle}>{t('modal.Confirm')}</Text>
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
