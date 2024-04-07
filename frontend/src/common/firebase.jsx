// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {GoogleAuthProvider,getAuth, signInWithPopup} from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBc1uyZkREWcik1cJLwIEGWBhWyYU6c4Dw",
  authDomain: "blogapp-8f7f1.firebaseapp.com",
  projectId: "blogapp-8f7f1",
  storageBucket: "blogapp-8f7f1.appspot.com",
  messagingSenderId: "311726388861",
  appId: "1:311726388861:web:2c4f363682411a3c4da314",
  measurementId: "G-C76G370X0C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const provider = new GoogleAuthProvider();
const auth = getAuth();
export const authWithGoogle = async()=>
{
    let user  = null;
    await signInWithPopup(auth,provider)
    .then((result)=>
{
    user = result.user
})
.catch((err)=>
{
    console.log(err)
})

return user
}
