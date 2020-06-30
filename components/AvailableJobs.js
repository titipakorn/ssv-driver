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
import {relativeTime, displayTime} from '../libs/day';

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
      from
      to
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
  const {navigation, id, from, to, tmPrimary, tmSecondary, onSelect} = row;
  return (
    <TouchableHighlight
      activeOpacity={0.8}
      underlayColor="#DDDDDD"
      onPress={() =>
        navigation.navigate('Job', {
          id: id,
          otherParam: 'anything you want here',
        })
      }
      style={[styles.item]}>
      <View style={styles.flexRow}>
        {from !== null && (
          <View style={[styles.flexColumn, {flex: 1}]}>
            <Text style={styles.locationPickup}>{from}</Text>
            <Text style={styles.locationDestination}>→ {to}</Text>
          </View>
        )}
        <View style={[styles.flexColumn, {textAlign: 'right'}]}>
          <Text style={[styles.txtPrimary, {alignSelf: 'flex-end'}]}>
            {tmPrimary}
          </Text>
          <Text style={[styles.txtSecondary, {alignSelf: 'flex-end'}]}>
            {tmSecondary}
          </Text>
        </View>
      </View>
    </TouchableHighlight>
  );
}
function itemProcess(data) {
  if (!data) return [];
  if (!data.items) return [];
  return data.items.map(i => ({
    ...i,
    tmPrimary: relativeTime(i.reserved_at),
    tmSecondary: displayTime(i.reserved_at),
  }));
}

export default function AvailableJobs({navigation, userId}) {
  let intval = React.useRef(null);
  const [items, setItems] = React.useState([]);
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

  React.useEffect(() => {
    clearInterval(intval);
    if (data && data.items.length > 0) {
      setItems(itemProcess(data));
      // need to force re-render time although no update data
      intval = setInterval(() => {
        setItems(itemProcess(data));
      }, 5000);
      return () => clearInterval(intval);
    }
  }, [data]);

  return (
    <>
      {loading && <ActivityIndicator />}
      {error && <Text>{error.message}</Text>}
      {data && (
        <FlatList
          data={items}
          renderItem={({item}) => (
            <Item
              {...item}
              navigation={navigation}
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
    paddingHorizontal: 5,
    paddingVertical: 8,
    borderBottomColor: '#ddd',
    borderBottomWidth: 0.5,
  },
  title: {
    fontSize: 32,
  },
  flexRow: {
    flexDirection: 'row',
    alignContent: 'space-between',
  },
  flexColumn: {
    flexDirection: 'column',
  },
  locationPickup: {
    fontSize: 24,
  },
  locationDestination: {
    fontSize: 18,
    color: '#888',
  },
  txtPrimary: {
    fontSize: 22,
    color: '#aaa',
  },
  txtSecondary: {
    fontSize: 18,
    color: '#666',
  },
});
