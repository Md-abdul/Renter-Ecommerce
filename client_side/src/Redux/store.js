import { legacy_createStore, applyMiddleware, combineReducers } from "redux";
import { thunk } from "redux-thunk";

import { reducer as UsersReducer } from "./Users/reducer";

const rootReducer = combineReducers({
  UsersReducer,
});

export const store = legacy_createStore(rootReducer, applyMiddleware(thunk));
