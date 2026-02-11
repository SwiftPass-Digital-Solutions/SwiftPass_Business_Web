import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import {
  createMigrate,
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  MigrationManifest,
} from "redux-persist";
import { apiSlice, appSlice, authSlice } from "./slices";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";
import { encryptTransform } from "redux-persist-transform-encrypt";
import { Logger } from "@/utils";
import localforage from "localforage";
// import { signalRMiddleware } from "@/middlewares";

const migrations: MigrationManifest = {
  0: (state) => state,
};

localforage.config({
  driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE],
});

const persistConfig = {
  key: "swiftpass",
  migrate: createMigrate(migrations),
  stateReconciler: autoMergeLevel2,
  storage: localforage,
  // storage: storage,
  storeName: "swiftpass-ab",
  timeout: 0,
  //  blacklist: ["api-slice"],
  transforms: [
    encryptTransform({
      onError(error) {
        Logger("Store Error", { error });
      },
      secretKey: import.meta.env.VITE_REDUX_SECRET_KEY || "",
    }),
  ],
  version: 0,
  // blacklist: [appSlice.reducerPath],
};

const rootReducer = combineReducers({
  [apiSlice.reducerPath]: apiSlice.reducer,
  [appSlice.reducerPath]: appSlice.reducer,
  [authSlice.reducerPath]: authSlice.reducer,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const persistedReducer = persistReducer<RootState, any>(
  persistConfig,
  rootReducer
);

export const store = configureStore({
  reducer: persistedReducer,
  devTools: import.meta.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
      immutableCheck: false, // Disable it entirely
      // OR increase the threshold:
      // immutableCheck: { warnAfter: 128 },
    }).concat(apiSlice.middleware),
});

export const persistor = persistStore(store);

setupListeners(store.dispatch);

// Types for use in the app
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
