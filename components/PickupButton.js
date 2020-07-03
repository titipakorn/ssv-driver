import React from 'react';
import {ActivityIndicator, Alert, TouchableOpacity, Text} from 'react-native';
import gql from 'graphql-tag';
import {useMutation} from '@apollo/react-hooks';

const PICKUP_TASK_MUTATION = gql`
  mutation PICKUP_TASK_MUTATION($jobID: smallint, $now: timestamptz) {
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

  React.useEffect(() => {
    if (!loading && processing) {
      setTimeout(() => {
        setProcessing(false);
      }, 300);
    }
  }, [loading]);

  return (
    <TouchableOpacity
      style={{
        backgroundColor: error ? '#f43030' : '#15c146',
        height: 55,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      disabled={processing || loading || error}
      onPress={() => {
        setProcessing(true);
        const variables = {
          jobID,
          now: new Date(),
        };
        console.log('press: accepting job', variables);
        pickup({
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
