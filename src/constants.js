export const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
export const DAY_LETTERS = ['S','M','T','W','T','F','S'];

export const TYPE_META = {
  time:     { label: 'Time of day',  placeholder: '7:30 AM' },
  check:    { label: 'Yes / No',     placeholder: '×' },
  weight:   { label: 'Weight',       placeholder: '70.0 kg' },
  counter:  { label: 'Counter',      placeholder: '2' },
  distance: { label: 'Distance',     placeholder: '5.0 km' },
  duration: { label: 'Duration',     placeholder: '30 min' },
  mood:     { label: 'Mood (1–5)',   placeholder: '4' },
};

export const DEFAULT_TRACKERS = [
  { id: 't1', name: 'WAKE',  type: 'time'     },
  { id: 't2', name: 'READ',  type: 'check'    },
  { id: 't3', name: 'WGHT',  type: 'weight',  unit: 'kg' },
  { id: 't4', name: 'CAFF',  type: 'counter'  },
  { id: 't5', name: 'RUN',   type: 'distance', unit: 'km' },
];
