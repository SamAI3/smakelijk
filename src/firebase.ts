import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB_Wfnv0pfCqbRPu1DSbVK8Ttr6tx81nfU",
  authDomain: "smakelijk-82409.firebaseapp.com",
  projectId: "smakelijk-82409",
  storageBucket: "smakelijk-82409.firebasestorage.app",
  messagingSenderId: "1003084699575",
  appId: "1:1003084699575:web:0bc88ddf2f82fb73517a32"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
