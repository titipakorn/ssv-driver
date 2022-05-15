import React from 'react';
import {
  Modal,
  TouchableHighlight,
  TouchableOpacity,
  Text,
  View,
} from 'react-native';
import {modelStyles} from './Modal';
import {displayDatetime} from '../libs/day';

export default function GeoIndicator({error, position}) {
  const [modalVisible, setModalVisible] = React.useState(false);
  if (position === 'unknown') {
    return <Text style={{fontSize: 15}}>⚪️</Text>;
  }
  if (error !== null) {
    console.log(`[GeoIndicator] ERR: ${error}`);
  }
  return (
    <>
      <TouchableOpacity
        onPress={() => {
          console.log('click');
          setModalVisible(true);
        }}>
        <Text style={{fontSize: 15}}>
          {error === null && '🟢'}
          {error !== null && '🔴'}
        </Text>
      </TouchableOpacity>
      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View style={modelStyles.centeredView}>
          <View
            style={[
              modelStyles.modalView,
              {
                flexDirection: 'column',
                alignItems: 'flex-start',
              },
            ]}>
            <Text style={modelStyles.modalTitle}>DEBUG</Text>
            {error && (
              <Text style={modelStyles.modalTextLeft}>{`${error}`}</Text>
            )}
            {position.timestamp && (
              <>
                <Text style={modelStyles.modalTextLeft}>
                  Timestamp: {displayDatetime(position.timestamp)}
                </Text>
                <Text style={modelStyles.modalTextLeft}>
                  Lat,Lon: {position.coords.latitude},{' '}
                  {position.coords.longitude}
                </Text>
                <Text style={modelStyles.modalTextLeft}>
                  Speed: {position.coords.speed}
                </Text>
                <Text style={modelStyles.modalTextLeft}>
                  Accuracy: {position.coords.accuracy}
                </Text>
              </>
            )}
            <TouchableHighlight
              style={{
                ...modelStyles.openButton,
                marginTop: 30,
                backgroundColor: '#2196F3',
              }}
              onPress={() => {
                setModalVisible(false);
              }}>
              <Text style={modelStyles.textStyle}>Close</Text>
            </TouchableHighlight>
          </View>
        </View>
      </Modal>
    </>
  );
}
