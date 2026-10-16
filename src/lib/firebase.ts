import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import firebaseConfigData from '../../firebase-applet-config.json';

export const firebaseConfig = {
  projectId: firebaseConfigData.projectId || "gen-lang-client-0579586724",
  appId: firebaseConfigData.appId || "1:621076165894:web:138413097c8f380709da87",
  apiKey: firebaseConfigData.apiKey || "AIzaSyA03T4-oVmCv1VqujV1jwaAR4NyqnlFmGY",
  authDomain: firebaseConfigData.authDomain || "gen-lang-client-0579586724.firebaseapp.com",
  firestoreDatabaseId: firebaseConfigData.firestoreDatabaseId || "ai-studio-contemporaryhori-20cba91b-a145-4179-8184-b0997b10bb67",
  storageBucket: firebaseConfigData.storageBucket || "gen-lang-client-0579586724.firebasestorage.app",
  messagingSenderId: firebaseConfigData.messagingSenderId || "621076165894",
  oAuthClientId: firebaseConfigData.oAuthClientId || "621076165894-b3je3k2gl7kgd2ggpdct76vf6bgpdprp.apps.googleusercontent.com",
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
});

// Initialize Firestore with specific databaseId
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Auth
export const auth: Auth = getAuth(app);

// Initialize Firebase Storage
export const storage: FirebaseStorage = getStorage(app);

export default app;
