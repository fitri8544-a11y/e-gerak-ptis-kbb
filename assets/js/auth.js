/* =========================================================
   E-GERAK PTIS KBB V2
   AUTH MODULE (GOOGLE SIGN-IN)
========================================================= */

import {

    auth,
    db,
    googleProvider,
    getUserProfile,
    updateLastLogin

} from "./firebase.js";

import {

    signInWithPopup,
    onAuthStateChanged,
    signOut

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {

    doc,
    setDoc,
    serverTimestamp

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/* =========================================================
   DOM
========================================================= */

const googleLoginBtn =
document.getElementById("googleLoginBtn");

const loginError =
document.getElementById("loginError");

const loginText =
document.getElementById("loginText");

const loadingSpinner =
document.getElementById("loadingSpinner");


/* =========================================================
   ERROR
========================================================= */

function showError(message){

    if(!loginError) return;

    loginError.textContent =
    message;

    loginError.classList.remove(
        "hidden"
    );

}


/* =========================================================
   LOADING
========================================================= */

function startLoading(){

    if(googleLoginBtn){

        googleLoginBtn.disabled = true;

    }

    if(loginText){

        loginText.innerHTML =
        "Membuka Google...";

    }

}


function stopLoading(){

    if(googleLoginBtn){

        googleLoginBtn.disabled = false;

    }

    if(loginText){

        loginText.innerHTML =
        "Teruskan dengan Google";

    }

}


/* =========================================================
   GOOGLE LOGIN
========================================================= */

async function loginWithGoogle(){

    try{

        if(loginError){

            loginError.classList.add(
                "hidden"
            );

        }

        startLoading();

        const result =
        await signInWithPopup(

            auth,

            googleProvider

        );

        const user =
        result.user;

        /* ===============================
           HANYA AKAUN KPM
        ============================== */

        if(

            !user.email.endsWith(
                "@moe.gov.my"
            )

        ){

            await signOut(auth);

            stopLoading();

            showError(

                "Hanya akaun @moe.gov.my dibenarkan."

            );

            return;

        }

        /* ===============================
           UPDATE LOGIN
        ============================== */

        await updateLastLogin(
            user.uid
        );

        let profile =
        await getUserProfile(
            user.uid
        );

        /* ===============================
           USER BARU
        ============================== */

        if(!profile){

            await setDoc(

                doc(
                    db,
                    "users",
                    user.uid
                ),

                {

                    nama:
                    user.displayName,

                    email:
                    user.email,

                    photoURL:
                    user.photoURL,

                    role:
                    "pengguna",

                    status:
                    "online",

                    createdAt:
                    serverTimestamp()

                }

            );

            profile =
            await getUserProfile(
                user.uid
            );

        }

        /* ===============================
           REDIRECT
        ============================== */

        if(profile.role === "admin"){

            window.location.href =
            "menuadmin.html";

        }else{

            window.location.href =
            "menupengguna.html";

        }

    }

    catch(error){

        console.error(error);

        stopLoading();

        showError(

            error.message

        );

    }

}


/* =========================================================
   LOGIN BUTTON
========================================================= */

if(googleLoginBtn){

    googleLoginBtn.addEventListener(

        "click",

        loginWithGoogle

    );

}


/* =========================================================
   SESSION
========================================================= */

onAuthStateChanged(

    auth,

    async(user)=>{

        if(!user) return;

        console.log(

            "Current User:",

            user.email

        );

    }

);