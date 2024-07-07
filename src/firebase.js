import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBAl2dnluW-E-_pJ_vM97Z-UYf9vXHdLXA",
  authDomain: "vts-database-d1f3e.firebaseapp.com",
  projectId: "vts-database-d1f3e",
  storageBucket: "vts-database-d1f3e.appspot.com",
  messagingSenderId: "750920106395",
  appId: "1:750920106395:web:ff6416f800e1c202b2213e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };