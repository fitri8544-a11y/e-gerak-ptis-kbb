/* ======================================================
   E-GERAK PTIS KBB V2
   SETTINGS.JS
====================================================== */

import {

    auth,
    db

} from "./firebase.js";

import {

    onAuthStateChanged

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {

    collection,
    getDocs,
    deleteDoc,
    doc

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const settingName =
document.getElementById("settingName");

const settingEmail =
document.getElementById("settingEmail");

const settingRole =
document.getElementById("settingRole");

const notificationToggle =
document.getElementById("notificationToggle");

const soundToggle =
document.getElementById("soundToggle");

const refreshToggle =
document.getElementById("refreshToggle");


/* ======================================================
   LOAD USER
====================================================== */

onAuthStateChanged(auth,async(user)=>{

    if(!user) return;

    settingEmail.textContent =
    user.email;

    try{

        const snap =
        await getDoc(

            doc(
                db,
                "users",
                user.uid
            )

        );

        if(snap.exists()){

            const data =
            snap.data();

            settingName.textContent =
            data.nama || "-";

            settingRole.textContent =
            data.role || "staff";

        }

    }catch(error){

        console.error(error);

    }

});


/* ======================================================
   LOAD SETTINGS
====================================================== */

notificationToggle.checked =
localStorage.getItem("notification")!=="false";

soundToggle.checked =
localStorage.getItem("sound")!=="false";

refreshToggle.checked =
localStorage.getItem("refresh")!=="false";


/* ======================================================
   SAVE SETTINGS
====================================================== */

notificationToggle.addEventListener("change",()=>{

    localStorage.setItem(

        "notification",

        notificationToggle.checked

    );

});


soundToggle.addEventListener("change",()=>{

    localStorage.setItem(

        "sound",

        soundToggle.checked

    );

});


refreshToggle.addEventListener("change",()=>{

    localStorage.setItem(

        "refresh",

        refreshToggle.checked

    );

});


/* ======================================================
   RESET STATISTIC
====================================================== */

document
.getElementById("resetStatisticBtn")
?.addEventListener("click",()=>{

    if(

        !confirm(

            "Reset statistik sistem?"

        )

    ) return;

    alert(

        "Statistik berjaya direset."

    );

});


/* ======================================================
   DELETE MOVEMENT
====================================================== */

document
.getElementById("clearMovementBtn")
?.addEventListener("click", async () => {

    const confirmDelete = confirm(
        "⚠ Semua rekod pergerakan akan dipadam.\n\nTindakan ini tidak boleh dibatalkan.\n\nTeruskan?"
    );

    if (!confirmDelete) return;

    try {

        const snapshot = await getDocs(
            collection(db, "movements")
        );

        let total = 0;

        for (const item of snapshot.docs) {

            await deleteDoc(
                doc(db, "movements", item.id)
            );

            total++;

        }

        alert(
            `✅ ${total} rekod berjaya dipadam.`
        );

        location.reload();

    } catch (error) {

        console.error(error);

        alert(
            "❌ Gagal memadam rekod."
        );

    }

});