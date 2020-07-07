import React from 'react';
import {Text} from 'react-native';
import dayjs from 'dayjs';

export default function StopWatch({startTime}) {
  let intval = React.useRef(null);
  const [tm, setTm] = React.useState(0);

  React.useEffect(() => {
    function duration(start) {
      return Math.floor((dayjs() - dayjs(start)) / 1000);
    }
    if (intval) clearInterval(intval);
    if (startTime) {
      setTm(duration(startTime));
      intval = setInterval(() => {
        setTm(duration(startTime));
      }, 1000);
    }
    return () => clearInterval(intval);
  }, [startTime]);

  return <Text>{tm} s</Text>;
}
