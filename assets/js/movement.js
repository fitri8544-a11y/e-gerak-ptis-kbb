/* =====================================================
   E-GERAK PTIS KBB V2
   Movement Manager V2
===================================================== */

/* =====================================================
   FIREBASE MODULAR
===================================================== */

import {
    startLiveLocation,
    stopLiveLocation,
    getCurrentLocation,
    getPlaceName
} from "./location.js";

import {

    auth,
    db

} from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {

    addDoc,
    collection,
    serverTimestamp,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    doc,
    getDoc,
    deleteDoc,
    updateDoc

} from
"https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const MovementManager = {

    modal: null,
    fabButton: null,
    closeButton: null,
    cancelButton: null,
    saveButton: null,

    movementType: null,
    movementLocation: null,
    movementDate: null,
    movementTime: null,
    movementActivity: null,
    movementNote: null,
    calendarToggle: null,

    loadingOverlay: null,

    movementList: [],

    currentMovementList : [],

    unsubscribeCurrentMovement : null,

    unsubscribeMovement:null,

    currentPage:1,

    rowsPerPage:10,

    init() {

        this.modal = document.getElementById("movementModal");

        this.fabButton = document.getElementById("fabButton");
        this.closeButton = document.getElementById("closeModal");
        this.cancelButton = document.getElementById("cancelMovement");
        this.saveButton = document.getElementById("saveMovement");

        this.movementType = document.getElementById("movementType");
        this.movementLocation = document.getElementById("movementLocation");
        this.movementDate = document.getElementById("movementDate");
        this.movementTime = document.getElementById("movementTime");
        this.movementActivity = document.getElementById("movementActivity");
        this.movementNote = document.getElementById("movementNote");
        this.calendarToggle = document.getElementById("calendarToggle");

        this.loadingOverlay =
        document.getElementById("loadingOverlay");

        this.registerEvents();

        onAuthStateChanged(auth, async (user) => {

            if (!user) return;

            this.loadCurrentStatus();

            await this.loadUserProfile(user);

            this.loadCurrentMovement();

            this.loadMovementHistory();

        });

    },

    registerEvents() {

        this.fabButton?.addEventListener(
            "click",
            ()=>this.openModal()
        );

        const adminMovementBtn =
        document.getElementById("adminMovementBtn");

        adminMovementBtn?.addEventListener(
            "click",
            ()=>this.openModal()
        );

        this.closeButton?.addEventListener(
            "click",
            ()=>this.closeModal()
        );

        this.cancelButton?.addEventListener(
            "click",
            ()=>this.closeModal()
        );

        this.modal?.addEventListener(
            "click",
            (e)=>{

                if(e.target===this.modal){

                    this.closeModal();

                }

            }
        );

        document.addEventListener(
            "keydown",
            (e)=>{

                if(e.key==="Escape"){

                    this.closeModal();

                }

            }
        );

        this.movementType?.addEventListener(

            "change",

            ()=>this.renderDynamicFields()

        );

        this.saveButton?.addEventListener(

            "click",

            ()=>this.saveMovement()

        );

/*==========================================
  GET CURRENT LOCATION
==========================================*/

const btnGetLocation =
document.getElementById("btnGetLocation");

btnGetLocation?.addEventListener(

    "click",

    async()=>{

        alert("Butang GPS ditekan");

        const status =
        document.getElementById("locationStatus");

        const input =
        document.getElementById("movementLocation");

        status.textContent =
        "📡 Mengesan lokasi...";

        try{

            const position =
            await getCurrentLocation();

            const lat =
            position.coords.latitude;

            const lng =
            position.coords.longitude;

            status.textContent =
            "📡 Mendapatkan nama lokasi...";

            const place =
            await getPlaceName(lat,lng);

            input.value =
            place;

            status.textContent =
        "🟢 Lokasi berjaya dikesan.";

        }

        catch(error){

            console.error(error);

            alert(
                "Kod: " + (error.code ?? "-") +
                "\nMesej: " + error.message
            );

            status.textContent =
            "🔴 " + error.message;

        }

    }

);

    },

    openModal(){

        this.modal.classList.remove("hidden");

        this.modal.classList.add("flex");

        this.setCurrentDateTime();

        this.renderDynamicFields();

    },

    closeModal(){

        this.hideLoading();

        this.modal.classList.remove("flex");

        this.modal.classList.add("hidden");

        this.resetForm();

    },

    resetForm(){

        this.movementType.value="";

        this.movementLocation.value="";

        this.movementActivity.value="";

        this.movementNote.value="";

        this.calendarToggle.checked=false;

        this.setCurrentDateTime();

        const container =
        document.getElementById("dynamicContent");

        if(container){

            container.innerHTML="";

        }

    },

    setCurrentDateTime(){

        const now = new Date();

        const date =
        now.toISOString().split("T")[0];

        const time =
        now.toLocaleTimeString(
            "en-GB",
            {
                hour:"2-digit",
                minute:"2-digit"
            }
        );

        this.movementDate.value=date;

        this.movementTime.value=time;

    },

    renderDynamicFields(){

    const container =
    document.getElementById("dynamicContent");

    const locationGroup =
    document.getElementById("locationGroup");

    const activityGroup =
    document.getElementById("activityGroup");

    const noteGroup =
    document.getElementById("noteGroup");

    const activityLabel =
    document.getElementById("activityLabel");

    if(!container) return;

    container.innerHTML = "";

    // Reset paparan
    locationGroup?.classList.remove("hidden");
    activityGroup?.classList.remove("hidden");
    noteGroup?.classList.remove("hidden");

    activityLabel.textContent = "Aktiviti";

    this.movementActivity.placeholder =
    "Nyatakan aktiviti";

    switch(this.movementType.value){

        case "office":

            // Tiada perubahan

        break;

        case "outsideSchool":

            activityLabel.textContent =
            "Aktiviti / Tujuan Lawatan";

            this.movementActivity.placeholder =
            "Contoh : Lawatan penyelenggaraan SK Taman Mahsuri";

        break;

        case "meeting":

            activityLabel.textContent =
            "Nama Mesyuarat / Aktiviti";

            this.movementActivity.placeholder =
            "Contoh : Mesyuarat JTK Bil.2";

        break;

        case "course":

            activityLabel.textContent =
            "Nama Kursus / Aktiviti";

            this.movementActivity.placeholder =
            "Contoh : Bengkel AI";

        break;

        case "leave":

            locationGroup?.classList.add("hidden");

            activityGroup?.classList.add("hidden");

            noteGroup?.classList.add("hidden");

            container.innerHTML = `

                <div>

                    <label class="block text-white mb-2">

                        Jenis Cuti

                    </label>

                    <select
                    id="leaveType"
                    class="w-full rounded-2xl p-4">

                        <option value="">Pilih Jenis Cuti</option>

                        <option>Cuti Rehat (CR)</option>

                        <option>Cuti Sakit (MC)</option>

                        <option>Cuti Tanpa Rekod (CTR)</option>

                        <option>Cuti Tanpa Gaji</option>

                    </select>

                </div>

            `;

        break;

        case "hrmis":

            activityLabel.textContent =
            "Tujuan HRMIS (4 Jam)";

            this.movementActivity.placeholder =
            "Contoh : Urusan Bank";

        break;

    }

},

validateForm(){

    if(!this.movementType.value){

        alert("Sila pilih Status Pergerakan.");

        return false;

    }

    if(
        this.movementType.value !== "leave"
        &&
        !this.movementLocation.value.trim()
    ){

        alert("Sila masukkan Lokasi.");

        return false;

    }

    if(
        this.movementType.value !== "leave"
        &&
        !this.movementActivity.value.trim()
    ){

        alert("Sila masukkan Aktiviti.");

        return false;

    }

    if(
        this.movementType.value==="leave"
    ){

        const leaveType =
        document.getElementById("leaveType");

        if(!leaveType?.value){

            alert("Sila pilih Jenis Cuti.");

            return false;

        }

    }

    return true;

},

async saveMovement(){

    if(!this.validateForm()) return;

    const user = auth.currentUser;

    if(!user){

        alert("Sila log masuk semula.");

        return;

    }

    const movementData={

        uid:user.uid,

        email:user.email,

        name:user.displayName || "",

        type:this.movementType.value,

        location:this.movementLocation.value.trim(),

        date:this.movementDate.value,

        time:this.movementTime.value,

        activity:this.movementActivity.value.trim(),

        note:this.movementNote.value.trim(),

        calendar:this.calendarToggle.checked,

        leaveType:
        document.getElementById("leaveType")?.value || "",

        status:"AKTIF",

        createdAt:
        serverTimestamp()

    };

    this.showLoading();

    try{

    const movementType =
    this.movementType.value;

    await addDoc(

        collection(db,"movements"),

        movementData

    );

    await updateDoc(

        doc(db,"users",user.uid),

        {

            online:true,

            currentStatus:movementType,

            currentLocation:this.movementLocation.value.trim(),

            currentActivity:this.movementActivity.value.trim(),

            lastMovement:serverTimestamp()

        }

    );

    /*==========================================
      LIVE LOCATION
    ==========================================*/

    switch(movementType){

        case "outsideSchool":

        case "meeting":

        case "course":

            await startLiveLocation();

            break;

        default:

            await stopLiveLocation();

            break;

    }

    this.hideLoading();

    alert("Pergerakan berjaya disimpan.");

    this.closeModal();

}catch(error){

    console.error(error);

    this.hideLoading();

    alert("Ralat semasa menyimpan data.");

}

},

loadCurrentStatus(){

    console.log("loadCurrentStatus dipanggil");

    const user = auth.currentUser;

    if(!user) return;

    const statusTitle =
    document.getElementById("currentStatus");

    const statusLocation =
    document.getElementById("currentLocation");

    const statusActivity =
    document.getElementById("currentActivity");

    const statusTime =
    document.getElementById("currentTime");

    const q = query(

        collection(db,"movements"),

        where("uid","==",user.uid),

        orderBy("createdAt","desc"),

        limit(1)

    );

    onSnapshot(q,(snapshot)=>{

        if(snapshot.empty){

            return;

        }

        const data =
        snapshot.docs[0].data();

        const statusMap={

            office:"🟢 DI PEJABAT",

            outsideSchool:"🚗 LUAR BERTUGAS",

            meeting:"👥 MESYUARAT",

            course:"🎓 BERKURSUS",

            leave:"🌴 CUTI",

            hrmis:"📄 HRMIS"

        };

        if(statusTitle){

            statusTitle.textContent =
            statusMap[data.type] || data.type;

        }

        if(statusLocation){

            statusLocation.textContent =
            data.location || "-";

        }

        if(statusActivity){

            statusActivity.textContent =
            data.activity || "-";

        }

        if(statusTime){

            statusTime.textContent =
            data.time || "-";

        }

    });

},

/* =====================================================
   LOAD MOVEMENT HISTORY
===================================================== */

loadMovementHistory(){

    const user =
    auth.currentUser;

    if(!user) return;

    if(this.unsubscribeMovement){

        this.unsubscribeMovement();

    }

    let movementQuery;

if(this.currentUserRole === "admin"){

    movementQuery = query(

        collection(db,"movements"),

        orderBy("createdAt","desc")

    );

}else{

    movementQuery = query(

        collection(db,"movements"),

        where("uid","==",user.uid),

        orderBy("createdAt","desc")

    );

}

    this.unsubscribeMovement =
    onSnapshot(movementQuery,(snapshot)=>{

        this.movementList=[];

        snapshot.forEach(doc=>{

            this.movementList.push({

                id:doc.id,

                ...doc.data()

            });

        });

        this.renderMovementTable();

    });

},

/* =====================================================
   RENDER TABLE
===================================================== */

renderMovementTable(){

    const tbody =
    document.getElementById("movementTable");

    if(!tbody) return;

    tbody.innerHTML="";

    if(this.movementList.length===0){

        tbody.innerHTML=`

        <tr>

            <td
            colspan="5"
            class="text-center py-8 text-slate-400">

                Tiada rekod.

            </td>

        </tr>

        `;

        return;

    }

    const start =
    (this.currentPage-1)
    *
    this.rowsPerPage;

    const pageData =
    this.movementList.slice(

        start,

        start+this.rowsPerPage

    );

    const statusMap={

        office:"🟢 Di Pejabat",

        outsideSchool:"🚗 Luar Bertugas",

        meeting:"👥 Mesyuarat",

        course:"🎓 Kursus",

        leave:"🌴 Cuti",

        hrmis:"📄 HRMIS"

    };

    pageData.forEach(item=>{

        tbody.innerHTML+=`

        <tr
        class="border-b hover:bg-slate-50">

            <td class="px-5 py-4">

                ${item.date||"-"}

            </td>

            <td class="px-5 py-4">

    ${item.time || "-"}

</td>

<td class="px-5 py-4 font-semibold">

    ${item.name || item.nama || this.currentUserName || "-"}

</td>

<td class="px-5 py-4">

    ${statusMap[item.type] || item.type}

</td>

            <td class="px-5 py-4">

                ${item.location||"-"}

            </td>

            <td class="px-5 py-4">

                ${item.activity||"-"}

            </td>

        </tr>

        `;

    });

    this.renderMovementPagination();

},

/* =====================================================
   PAGINATION
===================================================== */

renderMovementPagination(){

    const container =
    document.getElementById("movementPagination");

    container.innerHTML="";

    const totalPages =

    Math.ceil(

        this.movementList.length

        /

        this.rowsPerPage

    );

    if(totalPages<=1){

        return;

    }

    for(

        let i=1;

        i<=totalPages;

        i++

    ){

        const btn =
        document.createElement("button");

        btn.textContent=i;

        btn.className=

        i===this.currentPage

        ?

        "px-3 py-2 rounded-lg bg-blue-600 text-white"

        :

        "px-3 py-2 rounded-lg bg-slate-200 hover:bg-slate-300";

        btn.onclick=()=>{

            this.currentPage=i;

            this.renderMovementTable();

        };

        container.appendChild(btn);

    }

},

loadCurrentMovement(){

    if(this.unsubscribeCurrentMovement){

        this.unsubscribeCurrentMovement();

    }

    const movementQuery = query(

        collection(db,"movements"),

        orderBy("createdAt","desc")

    );

    this.unsubscribeCurrentMovement =
    onSnapshot(movementQuery,(snapshot)=>{

        const latestMovement = {};

        snapshot.forEach(doc=>{

            const data = doc.data();

            console.log("Movement :", data);

            if(!latestMovement[data.uid]){

                latestMovement[data.uid] = data;

            }

        });

        this.currentMovementList =
        Object.values(latestMovement);

        console.log(this.currentMovementList);

        this.renderCurrentMovement();

    });

},

renderCurrentMovement(){

    const tbody =
    document.getElementById("currentMovementTable");

    if(!tbody) return;

    tbody.innerHTML = "";

    const total =
    document.getElementById(
        "currentMovementTotal"
    );

    tbody.innerHTML = "";

    if(total){

        total.textContent =
        this.currentMovementList.length;

    }

    if(this.currentMovementList.length===0){

        tbody.innerHTML = `

        <tr>

            <td colspan="5"
                class="text-center py-10 text-slate-400">

                Tiada data.

            </td>

        </tr>

        `;

        return;

    }

    const statusColor={

        "Dalam Pejabat":
        "bg-green-500/20 text-green-300",

        "Luar Bertugas":
        "bg-yellow-500/20 text-yellow-300",

        "Mesyuarat":
        "bg-blue-500/20 text-blue-300",

        "Cuti":
        "bg-red-500/20 text-red-300"

    };

    const statusMap = {

        office: "🟢 Di Pejabat",

        outsideSchool: "🚗 Luar Bertugas",

        meeting: "👥 Mesyuarat",

        course: "🎓 Kursus",

        leave: "🌴 Cuti",

        hrmis: "📄 HRMIS"

    };

    this.currentMovementList.forEach(item=>{

    tbody.innerHTML += `

    <tr class="border-b hover:bg-slate-50">

    <td class="px-6 py-4 font-semibold">
        ${item.name || "-"}
    </td>

    <td class="px-6 py-4">
        ${statusMap[item.type] || item.type}
    </td>

    <td class="px-6 py-4">
        ${item.location || "-"}
    </td>

    <td class="px-6 py-4">
        ${item.time || "-"}
    </td>

</tr>

    `;

});

},

async loadUserProfile(user){

    if(!user) return;

    try{

        const userRef = doc(db,"users",user.uid);

        const snap = await getDoc(userRef);

        let role = "staff";
        let name = user.displayName || user.email || "Pengguna";

        if(snap.exists()){

            const data = snap.data();

            role = data.role || "staff";
            name = data.nama || name;

            this.currentUserRole = role;
            this.currentUserName = name;
            this.currentUserEmail = data.email || user.email;

        }else{

            this.currentUserRole = "staff";
            this.currentUserName = name;
            this.currentUserEmail = user.email;

        }

        const avatar =
        name
        .trim()
        .split(" ")
        .map(word => word.charAt(0))
        .join("")
        .substring(0,2)
        .toUpperCase();

        const userName =
        document.getElementById("userName");

        const userAvatar =
        document.getElementById("userAvatar");

        if(userName){

            userName.textContent = name;

        }

        if(userAvatar){

            userAvatar.textContent = avatar;

        }

    }catch(error){

        console.error(error);

    }

},

    showLoading(){

    if(!this.loadingOverlay) return;

    this.loadingOverlay.classList.remove("hidden");

    this.loadingOverlay.classList.add("flex");

    if(this.saveButton){

        this.saveButton.disabled = true;

        this.saveButton.innerHTML = `
            ⏳  Menyimpan...
        `;

    }

},

hideLoading(){

    if(!this.loadingOverlay) return;

    this.loadingOverlay.classList.remove("flex");

    this.loadingOverlay.classList.add("hidden");

    if(this.saveButton){

        this.saveButton.disabled = false;

        this.saveButton.innerHTML = `
            💾 Simpan Pergerakan
        `;

    }

}

};

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        MovementManager.init();

    }

);