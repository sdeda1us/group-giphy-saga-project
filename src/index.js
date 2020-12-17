import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App/App';
import axios from 'axios';

// redux
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import logger from 'redux-logger';

// sagas
import createSagaMiddleware from 'redux-saga';
import { takeEvery, put } from 'redux-saga/effects';

// reducer for storing search query
const searchString = (state = [], action) => {
  if (action.type === 'SET_RESULTS') {
    return action.payload;
  }
  return state;
};

// favorites reducer for storing clicked gifs before they get sent to DB
const favorites = (state=[], action) => {
    if (action.type === 'GET_FAVORITES') {
        return action.payload;
    }
    return state;
}

function* watcherSaga() {
    yield takeEvery('SEARCH', searchGiphy);
    yield takeEvery('SET_FAVORITE', addFavorite);
    yield takeEvery('FETCH_FAVORITES', fetchFavorites);
}

function* addFavorite(action) {
    console.log('in addFavorite saga function.........');
    try {
        yield axios.post('/api/favorite', action.payload);
        yield put({type: 'FETCH_FAVORITES'});
    } catch (error) {
        console.log('error with add favorite request.....', error);
        alert('something went wrong. please try again.');
    }
}

function* fetchFavorites() {
    console.log('in fetch favorites saga.......');
    try {
        const response = yield axios.get('/api/favorite')
        yield put({type: 'GET_FAVORITES', payload: response.data})
    } catch (error) {
        console.log('error with favorite get request.....', error);
        alert('something went wrong. please try again.');
    }
}

function* searchGiphy(action) {
  console.log('in searchGiphy saga function.....');
  try {
    const response = yield axios.get('/api/search/' + action.payload.term);
    yield put({ type: 'SET_RESULTS', payload: response.data.data });
  } catch (error) {
    console.log('error with add fruit request.....', error);
    alert('something went wrong. please try again.');
  }
}

// Create sagaMiddleware
const sagaMiddleware = createSagaMiddleware();

const storeInstance = createStore(
    combineReducers({
        searchString,
        favorites,
    }),
    // Add sagaMiddleware to our store
    applyMiddleware(sagaMiddleware, logger),
);

sagaMiddleware.run(watcherSaga);

ReactDOM.render(
  <Provider store={storeInstance}>
    <App />
  </Provider>,
  document.getElementById('react-root')
);
