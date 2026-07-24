/* =========================================================
   E-GERAK PTIS KBB V2
   FIREBASE CONFIG
========================================================= */

// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {

    getAuth,

    GoogleAuthProvider

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {

    getFirestore,

    collection,

    addDoc,

    setDoc,

    updateDoc,

    deleteDoc,

    getDoc,

    getDocs,

    doc,

    query,

    where,

    orderBy,

    limit,

    onSnapshot,

    serverTimestamp

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/* =========================================================
   FIREBASE CONFIG
========================================================= */

const firebaseConfig = {

    apiKey: "AIzaSyC2sxKr8MaTkUbnx884-A51FStR3H0ScGg",

    authDomain: "egerak-ptiskbb.firebaseapp.com",

    projectId: "egerak-ptiskbb",

    storageBucket: "egerak-ptiskbb.firebasestorage.app",

    messagingSenderId: "169403078334",

    appId: "1:169403078334:web:b9838e091da5a3d1aef0ef"

};


/* =========================================================
   INITIALIZE
========================================================= */

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const googleProvider =
new GoogleAuthProvider();

googleProvider.setCustomParameters({

    prompt: "select_account",

    hd: "moe.gov.my"

});

const db = getFirestore(app);

/* =========================================================
   USER PROFILE
========================================================= */

async function getUserProfile(uid){

    try{

        const ref =
        doc(
            db,
            "users",
            uid
        );

        const snap =
        await getDoc(ref);

        if(!snap.exists()){

            return null;

        }

        return{

            uid,

            ...snap.data()

        };

    }catch(error){

        console.error(error);

        return null;

    }

}

/* =========================================================
   UPDATE LAST LOGIN
========================================================= */

async function updateLastLogin(uid){

    try{

        await setDoc(

            doc(
                db,
                "users",
                uid
            ),

            {

                status:"online",

                lastLogin:
                serverTimestamp()

            },

            {

                merge:true

            }

        );

    }catch(error){

        console.error(error);

    }

}


/* =========================================================
   EXPORT
========================================================= */

export{

    app,

    auth,

    db,

    googleProvider,

    getUserProfile,

    updateLastLogin,

    collection,

    addDoc,

    setDoc,

    updateDoc,

    deleteDoc,

    getDoc,

    getDocs,

    doc,

    query,

    where,

    orderBy,

    limit,

    onSnapshot,

    serverTimestamp

};