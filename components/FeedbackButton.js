import React from 'react';
import {ActivityIndicator, Alert, TouchableOpacity, Text} from 'react-native';
import gql from 'graphql-tag';
import {useMutation} from '@apollo/react-hooks';

const ACCEPT_JOB_MUTATION = gql`
  mutation ACCEPT_JOB_MUTATION($jobID: smallint, $userID: uuid) {
    update_trip(where: {id: {_eq: $jobID}}, _set: {driver_id: $userID}) {
      affected_rows
      returning {
        id
        driver {
          username
          line_user_id
        }
      }
    }
  }
`;
// TODO: implement this feedback feature
export default function AccepJobButton({jobID, userID}) {
  const [accept_job, {loading, error}] = useMutation(ACCEPT_JOB_MUTATION);
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
  return (
    <TouchableOpacity
      style={{
        backgroundColor: error ? '#f43030' : '#15c146',
        height: 55,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      disabled={loading}
      onPress={() => {
        const variables = {
          jobID,
          userID,
        };
        console.log('press: accepting job', variables);
        accept_job({
          variables,
        })
          .then(res => {
            console.log('done: accepting job', res);
            console.log(res.data.update_trip.returning);
          })
          .catch(err => {
            console.log('err: ', err);
          })
          .finally(() => {
            console.log('finally');
          });
      }}>
      {buttontext}
    </TouchableOpacity>
  );
}
