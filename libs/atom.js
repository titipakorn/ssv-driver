import {atom} from 'recoil';

export const workingJobID = atom({
  key: 'workingJobID', // unique ID (with respect to other atoms/selectors)
  default: [], // default value (aka initial value)
});

export const isSharing = atom({
  key: 'isSharing', // unique ID (with respect to other atoms/selectors)
  default: [], // default value (aka initial value)
});
