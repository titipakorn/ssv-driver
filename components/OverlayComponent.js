import React from 'react';
import {View, StyleSheet} from 'react-native';

export default function OverlayComponent({behind, front, under}) {
  return (
    <View style={styles.center}>
      <View style={styles.behind}>{behind}</View>
      {front}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    width: '100%',
    height: '100%',
    // backgroundColor: '#3322ff88',
  },
  behind: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    // backgroundColor: 'pink',
  },
});
