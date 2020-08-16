import {
	combineReducers
} from 'redux';
import personalReducer from './personalReducer';
import productReducer from './productReducer';
import cartReducer from './cartReducer';
export default combineReducers({
	personal: personalReducer,
	product: productReducer,
	cart: cartReducer
});