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

const role =
(profile.role || "")
.toLowerCase()
.trim();

if(role === "admin"){

    window.location.replace(
        "menuadmin.html"
    );

}else{

    window.location.replace(
        "menupengguna.html"
    );

}

    }

    catch(error){

    console.error("LOGIN ERROR:", error);

    console.log("ERROR CODE:", error.code);

    console.log("ERROR MESSAGE:", error.message);

    alert(error.code);

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