import React from 'react';
import { Text } from 'react-native';
import dayjs from 'dayjs';

export default function StopWatch({ startTime }) {
  let intval = React.useRef(null);
  const [tm, setTm] = React.useState(['00', '00']);

  React.useEffect(() => {
    function duration(start) {
      return Math.floor((dayjs() - dayjs(start)) / 1000);
    }

    function numFormat(n) {
      const x = (n).toFixed(0)
      if (x.length === 1) return `0${x}`
      return `${x}`
    }

    if (intval) clearInterval(intval);
    if (startTime) {
      const d = duration(startTime)
      setTm([
        `${numFormat(d / 60)}`,
        `${numFormat(d % 60)}`,
      ])
      intval = setInterval(() => {
        const d = duration(startTime)
        setTm([
          `${numFormat(d / 60)}`,
          `${numFormat(d % 60)}`,
        ])
      }, 1000);
    }
    return () => clearInterval(intval);
  }, [startTime]);
  return <Text>{tm.join(":")}</Text>;
}
