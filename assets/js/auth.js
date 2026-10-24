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
    updateDoc,
    serverTimestamp,
    collection,
    query,
    where,
    getDocs

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

const userPhoto =
document.getElementById("userPhoto");


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
   SYNC STAFF PROFILE
========================================================= */

async function syncStaffProfile(user){

    try{

        const q = query(

            collection(db,"staff"),

            where("email","==",user.email)

        );

        const snapshot = await getDocs(q);

        if(snapshot.empty){

            return;

        }

        const staffDoc = snapshot.docs[0];

        await updateDoc(

            doc(db,"staff",staffDoc.id),

            {

                photoURL:

                user.photoURL || "",

                currentStatus:

                "office",

                lastLogin:

                serverTimestamp(),

                updatedAt:

                serverTimestamp()

            }

        );

        console.log(

            "✅ Staff Profile Sync"

        );

    }

    catch(error){

        console.error(

            "Sync Staff Error:",

            error

        );

    }

}

/* =========================================================
   SAVE USER PROFILE
========================================================= */

async function saveUserProfile(user){

    let profile =
    await getUserProfile(user.uid);

    await syncStaffProfile(user);


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

                // Dapatkan gambar daripada sesi dan akaun Google.
        let profilePhoto =
            user.photoURL ||
            user.providerData?.find(
                provider => provider.providerId === "google.com"
            )?.photoURL ||
            "";

        // Gunakan gambar tersimpan jika sesi tiada gambar.
        if (!profilePhoto) {
            try {
                const savedProfile = await getUserProfile(user.uid);
                profilePhoto = savedProfile?.photoURL || "";
            } catch (error) {
                console.warn("Gambar profil tersimpan tidak dapat dibaca:", error);
            }
        }

        const displayName = user.displayName || "Pengguna";

        const initials = displayName
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(name => name.charAt(0))
            .join("")
            .toUpperCase() || "U";

        function setProfileImage(image, onFailure) {
            image.alt = "Gambar profil " + displayName;
            image.referrerPolicy = "no-referrer";
            image.style.width = "100%";
            image.style.height = "100%";
            image.style.objectFit = "cover";
            image.style.borderRadius = "50%";

            image.onerror = () => {
                image.onerror = null;
                onFailure();
            };

            image.src = profilePhoto;
        }

        // Gambar pada dashboard admin.
        if (userPhoto) {
            const fallback =
                "https://ui-avatars.com/api/?name=" +
                encodeURIComponent(displayName) +
                "&background=2563EB&color=ffffff";

            if (profilePhoto) {
                setProfileImage(userPhoto, () => {
                    userPhoto.src = fallback;
                });
            } else {
                userPhoto.src = fallback;
            }
        }

        // Gambar pada dashboard pengguna.
        if (userAvatar) {
            if (profilePhoto) {
                if (userAvatar.tagName === "IMG") {
                    setProfileImage(userAvatar, () => {
                        userAvatar.alt = initials;
                    });
                } else {
                    const image = document.createElement("img");

                    userAvatar.style.overflow = "hidden";
                    userAvatar.replaceChildren(image);

                    setProfileImage(image, () => {
                        userAvatar.textContent = initials;
                    });
                }
            } else {
                userAvatar.textContent = initials;
            }
        }

    }

);

/* =========================================================
   LOGOUT
========================================================= */

const logoutButton =
document.getElementById("logoutButton");

if(logoutButton){

    logoutButton.addEventListener(

        "click",

        async()=>{

            try{

                const user =
                auth.currentUser;

                if(user){

                    /* ===============================
                       UPDATE USERS
                    =============================== */

                    await updateDoc(

                        doc(
                            db,
                            "users",
                            user.uid
                        ),

                        {

                            online: false,

                            status: "offline",

                            currentStatus: "",

                            currentLocation: "",

                            currentActivity: "",

                            lastLogout: serverTimestamp()

                        }

                    );

                    /* ===============================
                       UPDATE STAFF
                    =============================== */

                    const staffQuery =
                    query(

                        collection(
                            db,
                            "staff"
                        ),

                        where(
                            "email",
                            "==",
                            user.email
                        )

                    );

                    const staffSnapshot =
                    await getDocs(
                        staffQuery
                    );

                    if(!staffSnapshot.empty){

                        const staffDoc =
                        staffSnapshot.docs[0];

                        await updateDoc(

                            doc(
                                db,
                                "staff",
                                staffDoc.id
                            ),

                            {

                                currentStatus:
                                "offline",

                                updatedAt:
                                serverTimestamp()

                            }

                        );

                    }

                }

                await signOut(auth);

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