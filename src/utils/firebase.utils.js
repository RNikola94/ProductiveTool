// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase, push, ref, set } from 'firebase/database';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


const firebaseApi = import.meta.env.VITE_API_FIREBASE_KEY;

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: firebaseApi,
  authDomain: "productive-tool.firebaseapp.com",
  projectId: "productive-tool",
  storageBucket: "productive-tool.appspot.com",
  messagingSenderId: "178414914169",
  appId: "1:178414914169:web:ecfe2e0464f3d8d51be2a8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);



export const addInvoice = async (invoice) => {
  const invoiceRef = ref(db, `invoices/${invoice.id}`);
  await set(invoiceRef, invoice);
};


export const addNotification = (message) => {
  const notifRef = ref(rtdb, 'notifications');
  const newNotifRef = push(notifRef);
  set(newNotifRef, {
    message,
    createdAt: new Date().toISOString(),
  });
}
