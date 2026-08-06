/*======================================================
 PTIS DIGITAL DIRECTORY
======================================================*/

import { db } from "./firebase.js";

import {

    collection,
    onSnapshot

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

console.log("PTIS Directory Loaded");

/*======================================================
 GLOBAL
======================================================*/

const staffRef =
collection(db,"staff");

let staffData=[];

let currentFilter = "all";

let currentSearch = "";

let currentRole = "all";

let currentSort = "az";

/*======================================================
 COORDINATOR ELEMENT
======================================================*/

const coordinatorContainer =
document.getElementById(
    "coordinatorCardContainer"
);

/*======================================================
 RENDER COORDINATOR
======================================================*/

function renderCoordinator(){

    if(!coordinatorContainer) return;

    const coordinator =

    staffData.find(staff=>

        (staff.role || "")
        .toUpperCase()
        .includes("PENYELARAS")

    );

    if(!coordinator){

        coordinatorContainer.innerHTML=`

        <div class="bg-white rounded-3xl p-10 text-center border border-slate-200">

            <h3 class="text-lg font-bold text-slate-700">

                Penyelaras belum didaftarkan

            </h3>

        </div>

        `;

        return;

    }

    const photo =

    coordinator.photoURL ||

    "assets/images/default-avatar.png";

    coordinatorContainer.innerHTML=`

<div class="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">

<div class="grid lg:grid-cols-[260px_1fr]">

<div class="p-8 flex flex-col items-center text-center bg-slate-50">

<img

src="${photo}"

class="

w-36

h-36

rounded-full

object-cover

border-4

border-sky-500

shadow-lg">

<h2 class="

mt-6

text-2xl

font-black

text-slate-900">

${coordinator.nama || "-"}

</h2>

<div class="

mt-3

inline-flex

items-center

px-5

py-2

rounded-full

bg-sky-100

text-sky-700

font-bold">

${coordinator.role || "-"}

</div>

<p class="

mt-5

text-slate-500">

${coordinator.zone || "-"}

</p>

</div>

<div class="grid md:grid-cols-2 gap-6 p-8">

<div class="rounded-2xl border border-slate-200 p-6">

<div class="text-sm text-slate-500">

📍 Lokasi

</div>

<div class="

mt-3

font-semibold

text-slate-900">

${coordinator.currentLocation || "-"}

</div>

</div>

<div class="rounded-2xl border border-slate-200 p-6">

<div class="text-sm text-slate-500">

📋 Aktiviti

</div>

<div class="

mt-3

font-semibold

text-slate-900">

${coordinator.currentActivity || "-"}

</div>

</div>

<div class="rounded-2xl border border-slate-200 p-6">

<div class="text-sm text-slate-500">

📧 Email

</div>

<div class="

mt-3

font-semibold

text-slate-900

break-all">

${coordinator.email || "-"}

</div>

</div>

<div class="rounded-2xl border border-slate-200 p-6">

<div class="text-sm text-slate-500">

🟢 Status

</div>

<div class="

mt-3

font-semibold

text-green-600">

${coordinator.currentStatus || "-"}

</div>

</div>

</div>

</div>

</div>

`;

}

/*======================================================
 UPDATE HEADER STATS
======================================================*/

function updateHeaderStats(){

    /*==============================
      Jumlah Pegawai
    ==============================*/

    const totalBadge =
    document.getElementById("headerTotalBadge");

    if(totalBadge){

        totalBadge.textContent =
        `${staffData.length} Pegawai`;

    }

    const statTotalMembers =
    document.getElementById("statTotalMembers");

    if(statTotalMembers){

        statTotalMembers.textContent =
        staffData.length;

    }

    const navCountAll =
    document.getElementById("navCountAll");

    if(navCountAll){

        navCountAll.textContent =
        staffData.length;

    }

    /*==============================
      Penyelaras
    ==============================*/

    const coordinator =

    staffData.find(staff=>

        (staff.role || "")
        .toUpperCase()
        .includes("PENYELARAS")

    );

    if(coordinator){

        const statCoordinatorName =
        document.getElementById("statCoordinatorName");

        const statCoordinatorZone =
        document.getElementById("statCoordinatorZone");

        if(statCoordinatorName){

            statCoordinatorName.textContent =
            coordinator.nama || "-";

        }

        if(statCoordinatorZone){

            statCoordinatorZone.textContent =
            coordinator.zone || "-";

        }

    }

    /*==============================
      Status Bertugas
    ==============================*/

    let active = 0;

    let inactive = 0;

    staffData.forEach(staff=>{

        const status =

        (staff.currentStatus || "")
        .toLowerCase();

        if(

            status==="office" ||

            status==="outsideschool" ||

            status==="meeting" ||

            status==="course" ||

            status==="hrmis"

        ){

            active++;

        }else{

            inactive++;

        }

    });

    const statActiveNow =
    document.getElementById("statActiveNow");

    const statInactiveSummary =
    document.getElementById("statInactiveSummary");

    if(statActiveNow){

        statActiveNow.textContent =
        active;

    }

    if(statInactiveSummary){

        statInactiveSummary.textContent =
        `${inactive} Tidak Aktif`;

    }

}

/*======================================================
 UPDATE ZONE SIDEBAR
======================================================*/

function updateZoneSidebar(){

    const zoneCount={

        "Padang Serai":0,
        "Kulim":0,
        "Sungai Ular":0,
        "Bandar Baharu":0,
        "Serdang":0

    };

    staffData.forEach(staff=>{

    /* ======================================
       Penyelaras dipaparkan berasingan
       Tidak dikira dalam jumlah zon
    ====================================== */

    if(
        (staff.role || "")
        .toUpperCase()
        .includes("PENYELARAS")
    ){
        return;
    }

    const zone =
    (staff.zone || "")
    .toUpperCase();

    if(zone.includes("PADANG")){

        zoneCount["Padang Serai"]++;

    }

    else if(zone.includes("KULIM")){

        zoneCount["Kulim"]++;

    }

    else if(zone.includes("SUNGAI")){

        zoneCount["Sungai Ular"]++;

    }

    else if(zone.includes("BANDAR")){

        zoneCount["Bandar Baharu"]++;

    }

    else if(zone.includes("SERDANG")){

        zoneCount["Serdang"]++;

    }

});

    document.getElementById("navCountPadangSerai").textContent =
    zoneCount["Padang Serai"];

    document.getElementById("navCountKulim").textContent =
    zoneCount["Kulim"];

    document.getElementById("navCountSungaiUlar").textContent =
    zoneCount["Sungai Ular"];

    document.getElementById("navCountBandarBaharu").textContent =
    zoneCount["Bandar Baharu"];

    document.getElementById("navCountSerdang").textContent =
    zoneCount["Serdang"];

}

/*======================================================
 APPLY FILTERS
======================================================*/

function applyFilters(){

    return staffData.filter(staff=>{

        /* ========= Search ========= */

        if(currentSearch){

            const keyword =
            currentSearch.toLowerCase();

            const found =

                (staff.nama || "")
                .toLowerCase()
                .includes(keyword)

                ||

                (staff.email || "")
                .toLowerCase()
                .includes(keyword)

                ||

                (staff.role || "")
                .toLowerCase()
                .includes(keyword)

                ||

                (staff.zone || "")
                .toLowerCase()
                .includes(keyword);

            if(!found){

                return false;

            }

        }

        /* ========= Zone ========= */

        if(currentFilter!=="all"){

            const zone =

            (staff.zone || "")

            .toUpperCase();

            switch(currentFilter){

                case "Padang Serai":

                    if(!zone.includes("PADANG SERAI")){

                        return false;

                    }

                    break;

                case "Kulim":

                    if(

                        !zone.includes("PKG KULIM")

                    ){

                        return false;

                    }

                    break;

                case "Sungai Ular":

                    if(!zone.includes("SUNGAI ULAR")){

                        return false;

                    }

                    break;

                case "Bandar Baharu":

                    if(!zone.includes("BANDAR BAHARU")){

                        return false;

                    }

                    break;

                case "Serdang":

                    if(!zone.includes("SERDANG")){

                        return false;

                    }

                    break;

            }

        }

        /* ========= Role ========= */

        if(

            currentRole!=="all"

            &&

            staff.role!==currentRole

        ){

            return false;

        }

        return true;

    });

}

/*======================================================
 GROUP ZONE
======================================================*/

function groupByZone(list){

    const zones={};

    list.forEach(staff=>{
    
    /* ===============================
   Penyelaras dipaparkan
   di bahagian atas sahaja
=============================== */

        if(

            (staff.role || "")

            .toUpperCase()

            .includes("PENYELARAS")

        ){

            return;

        }

        const zone =

        staff.zone ||

        "LAIN-LAIN";

        if(!zones[zone]){

            zones[zone]=[];

        }

        zones[zone].push(staff);

    });

    return zones;

}

/*======================================================
 BUILD ZONE DATA
======================================================*/

function buildZoneData(){

    const zones={

        "Padang Serai":[],
        "Kulim":[],
        "Sungai Ular":[],
        "Bandar Baharu":[],
        "Serdang":[]

    };

    staffData.forEach(staff=>{

        /* ============================
           Penyelaras dipaparkan berasingan
        ============================ */

        if(

            (staff.role || "")
            .toUpperCase()
            .includes("PENYELARAS")

        ){

            return;

        }

        const zone=

        (staff.zone || "")
        .toUpperCase();

        if(zone.includes("PADANG")){

            zones["Padang Serai"].push(staff);

        }

        else if(zone.includes("KULIM")){

            zones["Kulim"].push(staff);

        }

        else if(zone.includes("SUNGAI")){

            zones["Sungai Ular"].push(staff);

        }

        else if(zone.includes("BANDAR")){

            zones["Bandar Baharu"].push(staff);

        }

        else if(zone.includes("SERDANG")){

            zones["Serdang"].push(staff);

        }

    });

    return zones;

}

/*======================================================
 STATUS BADGE
======================================================*/

function getStatusBadge(status){

    switch((status || "").toLowerCase()){

        case "online":

            return `
            <span class="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-700 font-semibold">
            🟢 Online
            </span>`;

        case "office":

            return `
            <span class="inline-flex items-center px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
            🏢 Di Pejabat
            </span>`;

        case "meeting":

            return `
            <span class="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold">
            🔵 Mesyuarat
            </span>`;

        case "course":

            return `
            <span class="inline-flex items-center px-4 py-2 rounded-full bg-yellow-100 text-yellow-700 font-semibold">
            🟡 Kursus
            </span>`;

        case "onsite":

            return `
            <span class="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-700 font-semibold">
            🟣 Bertugas Luar
            </span>`;

        case "leave":

            return `
            <span class="inline-flex items-center px-4 py-2 rounded-full bg-red-100 text-red-700 font-semibold">
            🔴 Cuti
            </span>`;

        default:

            return `
            <span class="inline-flex items-center px-4 py-2 rounded-full bg-slate-100 text-slate-700 font-semibold">
            ⚫ Offline
            </span>`;

    }

}

/*======================================================
 CREATE STAFF CARD
======================================================*/

function createStaffCard(staff){

    const photo =

    staff.photoURL ||

    "assets/images/default-avatar.png";

    const sekolahSeliaan =

    Array.isArray(staff.sekolahSeliaan)

    ? staff.sekolahSeliaan

    : [];

    const jumlahSekolah =

    sekolahSeliaan.length;

    const sekolahHTML =

    jumlahSekolah

    ?

    `

<details class="mt-3 text-left">

<summary class="cursor-pointer text-sky-600 text-xs font-semibold hover:text-sky-700">

📚 Lihat Senarai Sekolah (${jumlahSekolah})

</summary>

<div class="mt-3 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3">

<ul class="space-y-1 text-xs text-slate-600">

${sekolahSeliaan.map(sekolah=>`

<li>

• ${sekolah}

</li>

`).join("")}

</ul>

</div>

</details>

`

    :

    `

<div class="mt-3 text-xs text-slate-400">

Tiada Sekolah Seliaan

</div>

`;

    return `

<div class="bg-white rounded-3xl border border-slate-200 shadow-card hover:shadow-xl transition duration-300 overflow-hidden">

<div class="p-6 text-center">

<img

src="${photo}"

class="

w-24

h-24

rounded-full

object-cover

mx-auto

border-4

border-sky-500">

<h3 class="

mt-4

text-lg

font-black

text-slate-900">

${staff.nama || "-"}

</h3>

<p class="

text-sm

text-slate-500">

${staff.role || "-"}

</p>

<div class="

mt-4

text-xs

text-slate-500">

📍 ${staff.zone || "-"}

</div>

<div class="

mt-2

inline-flex

px-3

py-1

rounded-full

bg-sky-100

text-sky-700

text-xs

font-bold">

🏫 ${jumlahSekolah} Sekolah Seliaan

</div>

${sekolahHTML}

<div class="mt-5">

${getStatusBadge(staff.currentStatus)}

</div>

</div>

</div>

`;

}

/*======================================================
 RENDER DIRECTORY
======================================================*/

function renderDirectory(filter="all"){

    currentFilter = filter;

    const coordinatorSection =
    document.getElementById(
        "coordinatorSection"
    );

    if(coordinatorSection){

        coordinatorSection.style.display =
        filter==="all" && currentSearch===""
        ? ""
        : "none";

    }

    const container =
    document.getElementById(
        "zonesGridContainer"
    );

    if(!container) return;

    /* ===============================
       Ambil data yang telah ditapis
    =============================== */

    const filteredStaff =
    applyFilters();

    /* ===============================
       Group ikut zon
    =============================== */

    const zones =
    groupByZone(filteredStaff);

    let html="";

    /* ===============================
       Tiada hasil carian
    =============================== */

    if(filteredStaff.length===0){

        container.innerHTML=`

<div class="bg-white rounded-3xl border border-slate-200 p-16 text-center">

<div class="text-6xl mb-6">

🔍

</div>

<h2 class="text-2xl font-bold text-slate-800">

Tiada Rekod Dijumpai

</h2>

<p class="text-slate-500 mt-3">

Tiada maklumat yang sepadan dengan carian anda.

</p>

</div>

`;

        return;

    }

    /* ===============================
       Render setiap zon
    =============================== */

    Object.entries(zones)

    .forEach(([zone,members])=>{

        html += `

<section class="mb-16">

<div class="flex items-center justify-between mb-8">

<div>

<h2 class="text-3xl font-black text-slate-900">

📍 ${zone}

</h2>

<p class="text-slate-500 mt-2">

Direktori Ahli PTIS Zon ${zone}

</p>

</div>

<div class="px-5 py-2 rounded-full bg-sky-100 text-sky-700 font-bold">

${members.length} Ahli

</div>

</div>

<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">

`;

        members.forEach(staff=>{

            html += createStaffCard(staff);

        });

        html += `

</div>

</section>

`;

    });

    container.innerHTML = html;

}

/*======================================================
 COORDINATOR PAGE
======================================================*/

function renderCoordinatorOnly(){

    /* ===============================
       Paparkan semula seksyen penyelaras
    =============================== */

    const coordinatorSection =
    document.getElementById(
        "coordinatorSection"
    );

    if(coordinatorSection){

        coordinatorSection.style.display = "";

    }

    /* ===============================
       Sembunyikan semua zon
    =============================== */

    const container =
    document.getElementById(
        "zonesGridContainer"
    );

    if(container){

        container.innerHTML = "";

    }

}

/*======================================================
 SIDEBAR NAVIGATION
======================================================*/

function setActiveSidebar(button){

    document

    .querySelectorAll(".nav-item")

    .forEach(item=>{

        item.classList.remove(

            "active",

            "bg-[#0F172A]",

            "text-white"

        );

        item.classList.add(

            "text-slate-700"

        );

    });

    button.classList.add(

        "active",

        "bg-[#0F172A]",

        "text-white"

    );

    button.classList.remove(

        "text-slate-700"

    );

}

function initSidebarNavigation(){

    /* ==========================
       Semua Ahli
    ========================== */

    const allButton=

    document.querySelector(

        "[data-filter-type='all']"

    );

    if(allButton){

        allButton.onclick=()=>{

            setActiveSidebar(

                allButton

            );

            renderDirectory("all");

        };

    }

    /* ==========================
       Penyelaras
    ========================== */

    const coordinatorButton=

    document.querySelector(

        "[data-filter-type='coordinator']"

    );

    if(coordinatorButton){

        coordinatorButton.onclick=()=>{

            setActiveSidebar(

                coordinatorButton

            );

            renderCoordinatorOnly();

        };

    }

    /* ==========================
       Zon
    ========================== */

    document

    .querySelectorAll(

        "[data-filter-zone]"

    )

    .forEach(button=>{

        button.onclick=()=>{

            setActiveSidebar(

                button

            );

            renderDirectory(

                button.dataset.filterZone

            );

        };

    });

}

/*======================================================
 SEARCH ENGINE
======================================================*/

function initSearch(){

    const input =

    document.querySelector(

        "input[type='text']"

    );

    if(!input) return;

    input.addEventListener(

        "input",

        ()=>{

            currentSearch =

            input.value

            .trim();

            renderDirectory(

                currentFilter

            );

        }

    );

}

/*======================================================
 ZONE DROPDOWN
======================================================*/

function initZoneDropdown(){

    const dropdown =

    document.getElementById(
        "zoneFilter"
    );

    if(!dropdown) return;

    dropdown.addEventListener(

        "change",

        ()=>{

            currentFilter =

            dropdown.value;

            renderDirectory(

                currentFilter

            );

            syncSidebar();

        }

    );

}

/*======================================================
 SIDEBAR SYNC
======================================================*/

function syncSidebar(){

    document

    .querySelectorAll(".nav-item")

    .forEach(item=>{

        item.classList.remove(

            "active",

            "bg-[#0F172A]",

            "text-white"

        );

        item.classList.add(

            "text-slate-700"

        );

    });

    if(currentFilter==="all"){

        const button =

        document.querySelector(

            "[data-filter-type='all']"

        );

        if(button){

            button.classList.add(

                "active",

                "bg-[#0F172A]",

                "text-white"

            );

        }

        return;

    }

    const zoneButton =

    document.querySelector(

        `[data-filter-zone="${currentFilter}"]`

    );

    if(zoneButton){

        zoneButton.classList.add(

            "active",

            "bg-[#0F172A]",

            "text-white"

        );

    }

}

/*======================================================
 LOAD STAFF
======================================================*/

onSnapshot(

    staffRef,

    (snapshot)=>{

        staffData=[];

        snapshot.forEach(doc=>{

            staffData.push({

                id:doc.id,

                ...doc.data()

            });

        });

        console.log(

            "Jumlah Staff:",

            staffData.length

        );

        renderCoordinator();

        updateHeaderStats();

        updateZoneSidebar();

        const zones =
        groupByZone(

            applyFilters()

        );

        console.log(zones);

        renderDirectory();

        initSidebarNavigation();

        initSearch();

    }

);