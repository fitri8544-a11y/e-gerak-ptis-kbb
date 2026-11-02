/* =========================================================
   E-GERAK PTIS KBB
   AUTH MODULE

   Login dan logout hanya mengubah status sesi.
   Status pergerakan, lokasi dan aktiviti dikekalkan.
========================================================= */

import {
    auth,
    db,
    googleProvider,
    getUserProfile
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

const emailLogin =
    document.getElementById("emailLogin");

const passwordLogin =
    document.getElementById("passwordLogin");

const emailLoginBtn =
    document.getElementById("emailLoginBtn");

const userName =
    document.getElementById("userName");

const userAvatar =
    document.getElementById("userAvatar");

const userPhoto =
    document.getElementById("userPhoto");

/* =========================================================
   ERROR
========================================================= */

function showError(message) {
    if (!loginError) return;

    loginError.textContent = message;
    loginError.classList.remove("hidden");
}

/* =========================================================
   LOADING
========================================================= */

function startLoading() {
    if (googleLoginBtn) {
        googleLoginBtn.disabled = true;
    }

    if (loginText) {
        loginText.textContent = "Membuka Google...";
    }
}

function stopLoading() {
    if (googleLoginBtn) {
        googleLoginBtn.disabled = false;
    }

    if (loginText) {
        loginText.textContent = "Teruskan dengan Google";
    }
}

/* =========================================================
   SYNC STAFF PROFILE
   Tidak mengubah currentStatus, lokasi atau aktiviti.
========================================================= */

async function syncStaffProfile(user) {
    try {
        const staffQuery = query(
            collection(db, "staff"),
            where("email", "==", user.email)
        );

        const snapshot = await getDocs(staffQuery);

        if (snapshot.empty) return;

        const staffDoc = snapshot.docs[0];

        await updateDoc(
            doc(db, "staff", staffDoc.id),
            {
                photoURL: user.photoURL || "",
                lastLogin: serverTimestamp(),
                updatedAt: serverTimestamp()
            }
        );

        console.log("Staff Profile Sync berjaya.");
    } catch (error) {
        console.error("Sync Staff Error:", error);
    }
}

/* =========================================================
   SAVE USER PROFILE
========================================================= */

async function saveUserProfile(user) {
    let profile = await getUserProfile(user.uid);

    await syncStaffProfile(user);

    if (!profile || !profile.nama || !profile.email) {
        await setDoc(
            doc(db, "users", user.uid),
            {
                uid: user.uid,
                nama: user.displayName,
                email: user.email,
                photoURL: user.photoURL,

                role: profile?.role || "pengguna",
                zone: profile?.zone || "",
                sekolah: profile?.sekolah || "",

                online: true,
                status: "online",

                createdAt:
                    profile?.createdAt || serverTimestamp(),

                lastLogin: serverTimestamp()
            },
            { merge: true }
        );
    } else {
        await setDoc(
            doc(db, "users", user.uid),
            {
                nama: user.displayName,
                email: user.email,
                photoURL: user.photoURL,

                online: true,
                status: "online",

                lastLogin: serverTimestamp()
            },
            { merge: true }
        );
    }

    profile = await getUserProfile(user.uid);

    const role = (profile?.role || "")
        .toLowerCase()
        .trim();

    stopLoading();

    if (role === "admin") {
        window.location.replace("menuadmin.html");
    } else {
        window.location.replace("menupengguna.html");
    }
}

/* =========================================================
   GOOGLE LOGIN
========================================================= */

async function loginWithGoogle() {
    try {
        loginError?.classList.add("hidden");

        startLoading();

        const result = await signInWithPopup(
            auth,
            googleProvider
        );

        const user = result.user;

        if (
            !(user.email || "")
                .toLowerCase()
                .endsWith("@moe.gov.my")
        ) {
            await signOut(auth);

            stopLoading();

            showError(
                "Hanya akaun @moe.gov.my dibenarkan."
            );

            return;
        }

        await saveUserProfile(user);
    } catch (error) {
        console.error(error);

        stopLoading();
        showError(error.message);
    }
}

/* =========================================================
   EMAIL LOGIN
========================================================= */

async function loginWithEmail() {
    try {
        loginError?.classList.add("hidden");

        const email = emailLogin?.value.trim() || "";
        const password = passwordLogin?.value || "";

        if (!email || !password) {
            showError(
                "Sila masukkan email dan password."
            );

            return;
        }

        startLoading();

        const result = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        await saveUserProfile(result.user);
    } catch (error) {
        console.error(error);

        stopLoading();
        showError(error.message);
    }
}

/* =========================================================
   LOGIN BUTTON
========================================================= */

if (googleLoginBtn) {
    googleLoginBtn.addEventListener(
        "click",
        loginWithGoogle
    );
}

if (emailLoginBtn) {
    emailLoginBtn.addEventListener(
        "click",
        loginWithEmail
    );
}

/* =========================================================
   SESSION DAN GAMBAR PROFIL
========================================================= */

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        const pathname = window.location.pathname;

        if (
            pathname.includes("menupengguna.html") ||
            pathname.includes("menuadmin.html")
        ) {
            window.location.replace("index.html");
        }

        return;
    }

    console.log("Current User:", user.email);

    if (userName) {
        userName.textContent =
            user.displayName || "Pengguna";
    }

    let profilePhoto =
        user.photoURL ||
        user.providerData?.find(
            provider =>
                provider.providerId === "google.com"
        )?.photoURL ||
        "";

    if (!profilePhoto) {
        try {
            const savedProfile =
                await getUserProfile(user.uid);

            profilePhoto =
                savedProfile?.photoURL || "";
        } catch (error) {
            console.warn(
                "Gambar profil tersimpan tidak dapat dibaca:",
                error
            );
        }
    }

    const displayName =
        user.displayName || "Pengguna";

    const initials =
        displayName
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map(name => name.charAt(0))
            .join("")
            .toUpperCase() || "U";

    const fallback =
        "https://ui-avatars.com/api/?name=" +
        encodeURIComponent(displayName) +
        "&background=2563EB&color=ffffff";

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
        if (profilePhoto) {
            setProfileImage(userPhoto, () => {
                userPhoto.src = fallback;
            });
        } else {
            userPhoto.alt =
                "Gambar profil " + displayName;

            userPhoto.src = fallback;
        }
    }

    // Gambar pada dashboard pengguna.
    if (userAvatar) {
        if (userAvatar.tagName === "IMG") {
            if (profilePhoto) {
                setProfileImage(userAvatar, () => {
                    userAvatar.src = fallback;
                });
            } else {
                userAvatar.alt =
                    "Gambar profil " + displayName;

                userAvatar.src = fallback;
            }
        } else if (profilePhoto) {
            const image = document.createElement("img");

            userAvatar.style.overflow = "hidden";
            userAvatar.replaceChildren(image);

            setProfileImage(image, () => {
                userAvatar.textContent = initials;
            });
        } else {
            userAvatar.textContent = initials;
        }
    }
});

/* =========================================================
   LOGOUT
   Kemas kini status sesi sahaja.
   Rekod pergerakan dalam users dan staff dikekalkan.
========================================================= */

const logoutButton =
    document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
        try {
            const user = auth.currentUser;

            if (user) {
                await updateDoc(
                    doc(db, "users", user.uid),
                    {
                        online: false,
                        status: "offline",
                        lastLogout: serverTimestamp()
                    }
                );
            }

            await signOut(auth);

            window.location.replace("index.html");
        } catch (error) {
            console.error("Logout Error:", error);

            alert("Log keluar gagal.");
        }
    });
}