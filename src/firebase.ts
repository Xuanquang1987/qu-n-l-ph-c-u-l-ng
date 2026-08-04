import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

const dbId = firebaseConfig.firestoreDatabaseId;
export const db = dbId && dbId !== '(default)'
  ? getFirestore(app, dbId)
  : getFirestore(app);

signInAnonymously(auth).catch((error) => {
  console.warn('Firebase anonymous auth warning:', error);
});

