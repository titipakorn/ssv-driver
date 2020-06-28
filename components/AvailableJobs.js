import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableHighlight,
  TouchableOpacity,
  Text,
  View,
} from 'react-native';
import gql from 'graphql-tag';
import {useSubscription} from '@apollo/react-hooks';
import {bkkTime} from '../libs/day';

const QUEUE_SUBSCRIPTION = gql`
  subscription QUEUE_SUBSCRIPTION($userId: uuid) {
    items: trip(
      where: {
        dropped_off_at: {_is_null: true}
        _or: [{driver_id: null}, {driver_id: {_eq: $userId}}]
      }
      order_by: {reserved_at: desc}
    ) {
      id
      place_from
      place_to
      user {
        username
      }
      is_advanced_reservation
      reserved_at
      picked_up_at
    }
  }
`;

function Item(row) {
  const {id, place_from, place_to, reserved_at, onSelect, selected} = row;
  console.log(row);
  return (
    <TouchableHighlight
      activeOpacity={0.8}
      underlayColor="#DDDDDD"
      onPress={() => onSelect(id)}
      style={[styles.item]}>
      <View>
        {place_from !== null && (
          <Text>
            {place_from} ➠ {place_to}
          </Text>
        )}
        <Text>{bkkTime(reserved_at)}</Text>
      </View>
    </TouchableHighlight>
  );
}

export default function AvailableJobs({userId}) {
  const [selected, setSelected] = React.useState(new Map());
  const {loading, error, data} = useSubscription(QUEUE_SUBSCRIPTION, {
    shouldResubscribe: true,
    variables: {userId: userId},
  });
  const onSelect = React.useCallback(
    id => {
      const newSelected = new Map(selected);
      newSelected.set(id, !selected.get(id));

      setSelected(newSelected);
    },
    [selected],
  );
  return (
    <>
      {loading && <ActivityIndicator />}
      {error && <Text>{error}</Text>}
      {data && (
        <FlatList
          data={data.items}
          renderItem={({item}) => (
            <Item
              {...item}
              selected={!selected.get(item.id)}
              onSelect={onSelect}
            />
          )}
          keyExtractor={item => `${item.id}`}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 10,
  },
  item: {
    padding: 20,
    marginHorizontal: 5,
    borderBottomColor: '#ddd',
    borderBottomWidth: 0.5,
  },
  title: {
    fontSize: 32,
  },
});
