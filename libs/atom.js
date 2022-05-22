import {atom} from 'recoil';

export const OccupiedState = atom({
  key: 'OccupiedState', // unique ID (with respect to other atoms/selectors)
  default: false, // default value (aka initial value)
});

export const workingJobID = atom({
  key: 'workingJobID', // unique ID (with respect to other atoms/selectors)
  default: null, // default value (aka initial value)
});
