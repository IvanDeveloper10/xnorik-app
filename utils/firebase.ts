import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAvyZfz9P9yIoounALrfD6AMcgH-vuGaB8',
  authDomain: 'xnorik.firebaseapp.com',
  projectId: 'xnorik',
  storageBucket: 'xnorik.firebasestorage.app',
  messagingSenderId: '733525414136',
  appId: '1:733525414136:web:d240c108ff58564aeb6b0d',
  measurementId: 'G-4NNYWX13DM'
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);