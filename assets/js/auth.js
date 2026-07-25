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
    signInWithEmailAndPassword,
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

const emailLogin =
document.getElementById("emailLogin");

const passwordLogin =
document.getElementById("passwordLogin");

const emailLoginBtn =
document.getElementById("emailLoginBtn");

/* =========================================================
   USER HEADER
========================================================= */

const userName =
document.getElementById("userName");

const userAvatar =
document.getElementById("userAvatar");


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
   SAVE USER PROFILE
========================================================= */

async function saveUserProfile(user){

    let profile =
    await getUserProfile(user.uid);

    if(

        !profile ||

        !profile.nama ||

        !profile.email

    ){

        await setDoc(

            doc(
                db,
                "users",
                user.uid
            ),

            {

                uid:user.uid,

                nama:user.displayName,

                email:user.email,

                photoURL:user.photoURL,

                role:
                profile?.role || "pengguna",

                zone:
                profile?.zone || "",

                sekolah:
                profile?.sekolah || "",

                online:true,

                status:"online",

                createdAt:
                profile?.createdAt || serverTimestamp(),

                lastLogin:
                serverTimestamp()

            },

            {

                merge:true

            }

        );

    }else{

        await setDoc(

            doc(
                db,
                "users",
                user.uid
            ),

            {

                nama:user.displayName,

                email:user.email,

                photoURL:user.photoURL,

                online:true,

                status:"online",

                lastLogin:
                serverTimestamp()

            },

            {

                merge:true

            }

        );

    }

    profile =
    await getUserProfile(
        user.uid
    );

    const role =
    (profile.role || "")
    .toLowerCase()
    .trim();

    stopLoading();

    if(role==="admin"){

        window.location.replace(
            "menuadmin.html"
        );

    }else{

        window.location.replace(
            "menupengguna.html"
        );

    }

}


/* =========================================================
   GOOGLE LOGIN
========================================================= */

async function loginWithGoogle(){

    try{

        loginError?.classList.add("hidden");

        startLoading();

        const result =
        await signInWithPopup(

            auth,

            googleProvider

        );

        const user =
        result.user;

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

        await saveUserProfile(user);

    }

    catch(error){

        console.error(error);

        stopLoading();

        showError(error.message);

    }

}


/* =========================================================
   EMAIL LOGIN
========================================================= */

async function loginWithEmail(){

    try{

        loginError?.classList.add("hidden");

        const email =
        emailLogin.value.trim();

        const password =
        passwordLogin.value;

        if(!email || !password){

            showError(
                "Sila masukkan email dan password."
            );

            return;

        }

        startLoading();

        const result =
        await signInWithEmailAndPassword(

            auth,

            email,

            password

        );

        await saveUserProfile(
            result.user
        );

    }

    catch(error){

        console.error(error);

        stopLoading();

        showError(error.message);

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

if(emailLoginBtn){

    emailLoginBtn.addEventListener(

        "click",

        loginWithEmail

    );

}


/* =========================================================
   SESSION
========================================================= */

onAuthStateChanged(

    auth,

    async(user)=>{

        // Tiada pengguna login
        if(!user){

            if(

                window.location.pathname.includes("menupengguna.html") ||

                window.location.pathname.includes("menuadmin.html")

            ){

                window.location.replace("index.html");

            }

            return;

        }

        console.log(

            "Current User:",

            user.email

        );

        /* ===============================
           UPDATE HEADER
        ============================== */

        if(userName){

            userName.textContent =
            user.displayName || "Pengguna";

        }

        if(userAvatar){

            if(user.photoURL){

                userAvatar.innerHTML = `

                    <img
                    src="${user.photoURL}"
                    class="w-full h-full object-cover">

                `;

            }else{

                const initials =

                user.displayName

                ?.split(" ")

                .map(name=>name.charAt(0))

                .join("")

                .substring(0,2)

                .toUpperCase();

                userAvatar.textContent =
                initials || "U";

            }

        }

    }

);

/* =========================================================
   LOGOUT
========================================================= */

const logoutButton =
document.getElementById("logoutBtn");

if(logoutButton){

    logoutButton.addEventListener(
        "click",
        async()=>{

            try{

                const user =
                auth.currentUser;

                // Update status offline
                if(user){

                    await setDoc(

                        doc(
                            db,
                            "users",
                            user.uid
                        ),

                        {

                            status:"offline",

                            lastLogout:
                            serverTimestamp()

                        },

                        {
                            merge:true
                        }

                    );

                }

                // Firebase Logout
                await signOut(auth);

                // Kembali ke halaman utama
                window.location.replace(
                    "index.html"
                );

            }

            catch(error){

                console.error(
                    "Logout Error:",
                    error
                );

                alert(
                    "Log keluar gagal."
                );

            }

        }
    );

}