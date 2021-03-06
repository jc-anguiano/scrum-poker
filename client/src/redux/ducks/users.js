import { CREATE_ROOM, START_VOTING, LEAVE_ROOM } from './room';

// Actions
const ADD_USER = 'ADD_USER';
const REMOVE_USER = 'REMOVE_USER';
const SET_USER_STATUS = 'SET_USER_STATUS';
const SET_USER_CARD = 'SET_USER_CARD';

// Action creators
export function addUser(user) {
  return { type: ADD_USER, user };
}

export function removeUser(id) {
  return { type: REMOVE_USER, id };
}

export function setUserCard(id, card) {
  return { type: SET_USER_CARD, id, card };
}

export function setUserOffline(id) {
  return { type: SET_USER_STATUS, id, connected: false };
}

export function setUserOnline(id) {
  return { type: SET_USER_STATUS, id, connected: true };
}

// Reducer
export default function reducer(state = {}, action) {
  switch (action.type) {
    case CREATE_ROOM:
      return { ...action.users };

    case LEAVE_ROOM:
      return {};

    case ADD_USER:
      return { ...state, [action.user.id]: action.user };

    case REMOVE_USER:
      const { [action.id]: ignore, ...rest } = state;
      return rest;

    case SET_USER_STATUS:
      return Object.assign({}, state, {
        [action.id]: Object.assign({}, state[action.id], {
          connected: action.connected,
        }),
      });

    case SET_USER_CARD:
      return Object.assign({}, state, {
        [action.id]: Object.assign({}, state[action.id], {
          card: action.card,
        }),
      });

    case START_VOTING:
      return Object.keys(state).reduce((val, id) => {
        val[id] = { ...state[id], card: null };

        return val;
      }, {});

    default:
      return state;
  }
};
