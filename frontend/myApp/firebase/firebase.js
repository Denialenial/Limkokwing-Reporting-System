import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyCR2JcdE0Gsmjd_7xEWSFb11or4SuTtZuI",
  authDomain: "reporting-1e76a.firebaseapp.com",
  projectId: "reporting-1e76a",
  storageBucket: "reporting-1e76a.appspot.com",
  messagingSenderId: "811208825530",
  appId: "1:811208825530:web:22ffc2cf27fb18b0244083",
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});