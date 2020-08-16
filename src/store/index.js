import {
	createStore,
	applyMiddleware
} from 'redux';
import reduxLogger from 'redux-logger';
import reduxPromise from 'redux-promise';
import reduxThunk from 'redux-thunk';
import reducer from './reducers/index';
const store = createStore(
	reducer,
	applyMiddleware(reduxLogger, reduxPromise, reduxThunk)
);
export default store;