/* =====================================================
   E-GERAK PTIS KBB V2
   Movement Manager V2
===================================================== */

/* =====================================================
   FIREBASE MODULAR
===================================================== */

import {

    auth,
    db

} from "./firebase.js";

import {

    addDoc,
    collection,
    serverTimestamp,
    query,
    where,
    orderBy,
    limit,
    onSnapshot

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

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

        auth.onAuthStateChanged?.(()=>{

            this.loadCurrentStatus();

        });

    },

    registerEvents() {

        this.fabButton?.addEventListener(
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

        await addDoc(

    collection(

        db,

        "movements"

    ),

    movementData

);

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

    showLoading(){

    if(!this.loadingOverlay) return;

    this.loadingOverlay.classList.remove("hidden");

    this.loadingOverlay.classList.add("flex");

    if(this.saveButton){

        this.saveButton.disabled = true;

        this.saveButton.innerHTML = `
            <span class="animate-pulse">
                ⏳ Menyimpan...
            </span>
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