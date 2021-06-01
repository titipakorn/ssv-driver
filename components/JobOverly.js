import { useNavigation } from '@react-navigation/core';
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { TouchableOpacity } from 'react-native-gesture-handler';

const YELLOW = 'rgba(252, 186, 3, 0.5)';
const RED = 'rgba(249, 88, 67, 0.5)';

export default function JobOverlay({
  isWorking, setWorking
}) {

  return (
    <View style={styles.container}>
      {!isWorking &&
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
              onPress={() => {
                setWorking(true)
              }}>
              <Text>
                Start working
                </Text>
            </TouchableOpacity>
          </View>
        </View>}
      {isWorking &&
        <Icon
          raised
          name="pause-outline"
          type="ionicon"
          containerStyle={{ backgroundColor: '#000000' }}
          onPress={() => {
            setWorking(false)
          }}
        />
      }
      <View style={{ width: 10 }}></View>
    </View>
  );
}

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
