/*======================================================
 E-GERAK PTIS KBB V2
 HOME DASHBOARD
======================================================*/

import { db } from "./firebase.js";

console.log("Dashboard Version 28 Jul");

import {
    collection,
    query,
    where,
    orderBy,
    limit,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/*======================================================
 GLOBAL
======================================================*/

const usersRef =
collection(db,"users");

const movementsRef =
collection(db,"movements");

const staffRef =
collection(db,"staff");

let dashboardData={

    totalMembers:0,
    officeMembers:0,
    activeMovement:0,
    absentMembers:0,
    totalTasks:0

};

const zoneData={

    "Padang Serai":{
        ahli:0,
        office:0,
        movement:0
    },

    "Kulim":{
        ahli:0,
        office:0,
        movement:0
    },

    "Sungai Ular":{
        ahli:0,
        office:0,
        movement:0
    },

    "Bandar Baharu":{
        ahli:0,
        office:0,
        movement:0
    },

    "Serdang":{
        ahli:0,
        office:0,
        movement:0
    }

};

let movementList=[];

let topMovementData=[];

let companionLookup = {};


/*======================================================
 ELEMENTS
======================================================*/

const totalMembersEl =
document.getElementById("totalMembers");

const officeMembersEl =
document.getElementById("officeMembers");

const activeMovementEl =
document.getElementById("activeMovement");

const absentMembersEl =
document.getElementById("absentMembers");

const totalTasksEl =
document.getElementById("totalTasks");

const firebaseStatusEl =
document.getElementById("firebaseStatus");

const topMovementList =
document.getElementById("topMovementList");

/*======================================================
LIVE MOVEMENT
======================================================*/

const movementContainer =
document.getElementById("liveMovementContainer");

const movementTotal =
document.getElementById("liveMovementTotal");

/*======================================================
ZONE ELEMENTS
======================================================*/

const zones={

    "Padang Serai":{

        ahli:
        document.getElementById("padangAhli"),

        office:
        document.getElementById("padangOffice"),

        movement:
        document.getElementById("padangMovement"),

        progress:
        document.getElementById("padangProgress")

    },

    "Kulim":{

        ahli:
        document.getElementById("kulimAhli"),

        office:
        document.getElementById("kulimOffice"),

        movement:
        document.getElementById("kulimMovement"),

        progress:
        document.getElementById("kulimProgress")

    },

    "Sungai Ular":{

        ahli:
        document.getElementById("sungaiAhli"),

        office:
        document.getElementById("sungaiOffice"),

        movement:
        document.getElementById("sungaiMovement"),

        progress:
        document.getElementById("sungaiProgress")

    },

    "Bandar Baharu":{

        ahli:
        document.getElementById("bbAhli"),

        office:
        document.getElementById("bbOffice"),

        movement:
        document.getElementById("bbMovement"),

        progress:
        document.getElementById("bbProgress")

    },

    "Serdang":{

        ahli:
        document.getElementById("serdangAhli"),

        office:
        document.getElementById("serdangOffice"),

        movement:
        document.getElementById("serdangMovement"),

        progress:
        document.getElementById("serdangProgress")

    }

};

/*======================================================
 UPDATE KPI
======================================================*/

function updateKPI(){

    totalMembersEl.textContent =
    dashboardData.totalMembers;

    officeMembersEl.textContent =
    dashboardData.officeMembers;

    activeMovementEl.textContent =
    dashboardData.activeMovement;

    absentMembersEl.textContent =
    dashboardData.absentMembers;

    totalTasksEl.textContent =
    dashboardData.totalTasks;

}

/*======================================================
UPDATE ZONES
======================================================*/

function updateZones(){

    Object.keys(zoneData).forEach(zone=>{

        const card=
        zones[zone];

        if(!card) return;

        const data=
        zoneData[zone];

        card.ahli.textContent=
        data.ahli;

        card.office.textContent=
        data.office;

        card.movement.textContent=
        data.movement;

        const percent=

        data.ahli===0

        ?0

        :(data.office/data.ahli)*100;

        card.progress.style.width=
        percent+"%";

    });

}

/*======================================================
FORMAT TIME
======================================================*/

function formatTime(timestamp){

    if(!timestamp) return "-";

    try{

        const date = timestamp.toDate();

        return date.toLocaleTimeString(
            "ms-MY",
            {
                hour:"2-digit",
                minute:"2-digit",
                hour12:false
            }
        );

    }catch(error){

        return "-";

    }

}

/*======================================================
UPDATE LIVE MOVEMENT
======================================================*/

function renderMovement(list){

    if(!movementContainer) return;

    movementContainer.innerHTML="";

    if(movementTotal){

        movementTotal.textContent=list.length;

    }

    if(list.length===0){

        movementContainer.innerHTML=`

        <div class="py-16 text-center">

            <div class="text-5xl mb-4">

                📭

            </div>

            <h3 class="text-xl font-bold text-slate-300">

                Tiada Pergerakan Direkodkan

            </h3>

            <p class="text-slate-500 mt-2">

                Semua ahli berada dalam keadaan normal.

            </p>

        </div>

        `;

        return;

    }

    const priority={

        outsideSchool:1,
        meeting:2,
        course:3,
        hrmis:4,
        leave:5,
        office:6

    };

    list.sort((a,b)=>
        (priority[a.status]||99)-
        (priority[b.status]||99)
    );

    let html=`

    <div class="overflow-x-auto max-h-[650px]">

    <table class="w-full">

        <thead class="sticky top-0 z-20 bg-slate-900">

            <tr class="border-b border-slate-700">

                <th class="px-6 py-4 text-left font-semibold text-slate-300">
                    Nama
                </th>

                <th class="px-6 py-4 text-left font-semibold text-slate-300">
                    Status
                </th>

                <th class="px-6 py-4 text-left font-semibold text-slate-300">
                    Zon / Lokasi
                </th>

                <th class="px-6 py-4 text-left font-semibold text-slate-300">
                    Aktiviti
                </th>

                <th class="px-6 py-4 text-left font-semibold text-slate-300">
                    Masa
                </th>

            </tr>

        </thead>

        <tbody>

    `;

    list.forEach(item=>{

        let badge="";
        let badgeClass="";

        switch(item.status){

    case "office":

        badge="PEJABAT";

        badgeClass=
        "bg-green-500/10 border border-green-500/20 text-green-300";

        break;

    case "outsideSchool":

        badge="BERTUGAS";

        badgeClass=
        "bg-yellow-500/10 border border-yellow-500/20 text-yellow-300";

        break;

    case "meeting":

        badge="MESYUARAT";

        badgeClass=
        "bg-blue-500/10 border border-blue-500/20 text-blue-300";

        break;

    case "course":

        badge="KURSUS";

        badgeClass=
        "bg-purple-500/10 border border-purple-500/20 text-purple-300";

        break;

    case "hrmis":

        badge="HRMIS";

        badgeClass=
        "bg-cyan-500/10 border border-cyan-500/20 text-cyan-300";

        break;

    case "leave":

        badge="CUTI";

        badgeClass=
        "bg-red-500/10 border border-red-500/20 text-red-300";

        break;

    default:

        badge=item.status.toUpperCase();

        badgeClass=
        "bg-slate-500/10 border border-slate-500/20 text-slate-300";

}

        html+=`

        <tr class="border-b border-slate-800 hover:bg-slate-800/40 transition">

            <td class="px-6 py-5">

    <div class="font-bold text-white">

        ${item.nama}

    </div>

    <div class="text-xs text-slate-500 mt-1">

        ${item.role || "-"}

    </div>

    ${
        companionLookup[item.uid]
        ?`
        <div class="mt-2
        inline-flex
        items-center
        gap-2
        px-3
        py-1
        rounded-full
        bg-cyan-500/10
        border
        border-cyan-500/20
        text-cyan-300
        text-xs
        font-semibold">

            👥 Bersama:
            ${companionLookup[item.uid].leaderName}

        </div>
        `
        :""
    }

</td>

            <td class="px-6 py-5">

                <span
class="
inline-flex
items-center
gap-2
px-3
py-1
rounded-full
text-xs
font-bold
uppercase
tracking-wide
${badgeClass}">

    <span class="text-[10px]">●</span>

    ${badge}

</span>

            </td>

            <td class="px-6 py-5 text-slate-300">

                ${item.lokasi || item.zone || "-"}

            </td>

            <td class="px-6 py-5 text-slate-300">

                ${item.aktiviti || "-"}

            </td>

            <td class="px-6 py-5 text-slate-400 whitespace-nowrap">

                ${formatTime(item.time)}

            </td>

        </tr>

        `;

    });

    html+=`

        </tbody>

    </table>

    </div>

    `;

    movementContainer.innerHTML=html;

}

/*======================================================
TOP MOVEMENT
======================================================*/

function renderTopMovement(data){

    if(!topMovementList) return;

    topMovementList.innerHTML="";

    if(data.length===0){

        topMovementList.innerHTML=`

        <div class="text-slate-500">

            Tiada rekod.

        </div>

        `;

        return;

    }

    const medal=["🥇","🥈","🥉"];

    data.slice(0,3).forEach((item,index)=>{

        topMovementList.innerHTML+=`

        <div class="flex items-center justify-between">

            <div>

                <div class="font-bold">

                    ${medal[index]} ${item.nama}

                </div>

            </div>

            <div
class="px-3
py-1
rounded-full
bg-cyan-500/10
border
border-cyan-500/20
text-cyan-300
text-sm
font-bold">

    ${item.total} Tugasan

</div>

        </div>

        `;

    });

}

/*======================================================
LOAD TOP MOVEMENT
======================================================*/

onSnapshot(movementsRef,(snapshot)=>{

    const ranking={};

    companionLookup = {};

    snapshot.forEach(doc=>{

        const data=doc.data();

        if(Array.isArray(data.companions)){

            data.companions.forEach(companion=>{

                companionLookup[companion.uid]={

                leaderName:data.name || "PTIS",

                leaderUid:data.uid || "",

                activity:data.activity || "",

                location:data.location || ""

            };

        });

}

        const nama=
        data.name ||
        data.email ||
        "Pengguna";

        if(!ranking[nama]){

            ranking[nama]=0;

        }

        ranking[nama]++;

    });

    topMovementData=
    Object.entries(ranking)
    .map(item=>({

        nama:item[0],

        total:item[1]

    }))
    .sort((a,b)=>b.total-a.total);

    renderTopMovement(
        topMovementData
    );

});

/*======================================================
ZONE MAPPER
======================================================*/

function getZoneKey(zone){

    if(!zone) return null;

    zone =
    zone.toUpperCase().trim();

    if(zone.includes("PPD")){

        return null;

    }

    if(zone.includes("PADANG SERAI")){

        return "Padang Serai";

    }

    if(zone.includes("KULIM")){

        return "Kulim";

    }

    if(zone.includes("SUNGAI ULAR")){

        return "Sungai Ular";

    }

    if(zone.includes("BANDAR BAHARU")){

        return "Bandar Baharu";

    }

    if(zone.includes("SERDANG")){

        return "Serdang";

    }

    return null;

}


/*======================================================
 FIREBASE STATUS
======================================================*/

function updateFirebaseStatus(){

    if(firebaseStatusEl){

        firebaseStatusEl.textContent=
        "ONLINE";

    }

}


/*======================================================
 INIT
======================================================*/

function initDashboard(){

    updateFirebaseStatus();

    updateKPI();

}


initDashboard();

/*======================================================
 TOTAL STAFF
======================================================*/

onSnapshot(staffRef,(snapshot)=>{

    dashboardData.totalMembers =
    snapshot.size;

    updateKPI();

});

/*======================================================
STAFF BY ZONE
======================================================*/

onSnapshot(staffRef,(snapshot)=>{

    Object.keys(zoneData).forEach(zone=>{

        zoneData[zone].ahli=0;

    });

    snapshot.forEach(doc=>{

        const staff=
        doc.data();

        const zone =
        getZoneKey(
        staff.zone
        );

        if(zone && zoneData[zone]){

            zoneData[zone].ahli++;

        }

    });

    updateZones();

});


/*======================================================
 LOAD KPI REALTIME (STAFF + USERS)
======================================================*/

let staffCache = [];
let usersCache = [];

function refreshRealtimeDashboard(){

    dashboardData.officeMembers = 0;
    dashboardData.activeMovement = 0;
    dashboardData.absentMembers = 0;
    dashboardData.totalTasks = 0;

    movementList = [];

    Object.keys(zoneData).forEach(zone=>{

        zoneData[zone].office = 0;
        zoneData[zone].movement = 0;

    });

    staffCache.forEach(staff=>{

        const zone = getZoneKey(staff.zone);

        switch((staff.currentStatus || "").toLowerCase()){

    case "office":

        dashboardData.officeMembers++;

        if(zone && zoneData[zone]){

            zoneData[zone].office++;

        }

        break;

    case "outsideschool":
    case "meeting":
    case "course":
    case "hrmis":

        dashboardData.activeMovement++;
        dashboardData.totalTasks++;

        movementList.push({

            uid: staff.uid || "",
            nama: staff.nama || "PTIS",
            role: staff.role || "",
            status: staff.currentStatus || "",
            zone: zone,
            lokasi: staff.currentLocation || "",
            aktiviti: staff.currentActivity || "",
            time: staff.updatedAt || null

        });

        if(zone && zoneData[zone]){

            zoneData[zone].movement++;

        }

        break;

    case "leave":

        dashboardData.absentMembers++;

        break;

}

    });

    updateKPI();

    updateZones();

    renderMovement(movementList);

    updateCoordinatorCard();

}

/*======================================================
  PENYELARAS PTIS DAERAH
======================================================*/

function updateCoordinatorCard(){

    const coordinator =

    staffCache.find(staff=>

        (staff.role || "")
        .toUpperCase()
        .includes("PENYELARAS")

    );

    if(!coordinator) return;

    /* ===============================
       PHOTO
    ============================== */

    const coordinatorPhoto =
    document.getElementById("coordinatorPhoto");

    if(coordinatorPhoto){

        coordinatorPhoto.src =
        coordinator.photoURL ||
        "assets/images/default-avatar.png";

    }

    /* ===============================
       NAME
    ============================== */

    document.getElementById("coordinatorName").textContent =
    coordinator.nama || "-";

    document.getElementById("coordinatorRole").textContent =
    coordinator.role || "-";

    document.getElementById("coordinatorLocation").textContent =
    coordinator.currentLocation || "-";

    document.getElementById("coordinatorActivity").textContent =
    coordinator.currentActivity || "-";

    /* ===============================
       UPDATED TIME
    ============================== */

    const updatedTime =
    coordinator.updatedAt
    ? coordinator.updatedAt.toDate()
    : null;

    document.getElementById("coordinatorTime").textContent =

    updatedTime

    ?

    updatedTime.toLocaleDateString(
        "ms-MY",
        {
            day:"numeric",
            month:"long",
            year:"numeric"
        }
    )

    +

    " • "

    +

    updatedTime.toLocaleTimeString(
        "ms-MY",
        {
            hour:"2-digit",
            minute:"2-digit"
        }
    )

    :

    "-";

    /* ===============================
       STATUS BADGE
    ============================== */

    const badge =
    document.getElementById("coordinatorBadge");

    const status =
    (coordinator.currentStatus || "")
    .toLowerCase();

    switch(status){

        case "office":

            badge.className =
            "px-5 py-3 rounded-full bg-green-500/20 text-green-300 font-bold";

            badge.innerHTML =
            "🟢 Dalam Pejabat";

        break;

        case "outsideschool":

            badge.className =
            "px-5 py-3 rounded-full bg-yellow-500/20 text-yellow-300 font-bold";

            badge.innerHTML =
            "🚗 Luar Bertugas";

        break;

        case "meeting":

            badge.className =
            "px-5 py-3 rounded-full bg-blue-500/20 text-blue-300 font-bold";

            badge.innerHTML =
            "👥 Mesyuarat";

        break;

        case "course":

            badge.className =
            "px-5 py-3 rounded-full bg-purple-500/20 text-purple-300 font-bold";

            badge.innerHTML =
            "🎓 Berkursus";

        break;

        case "hrmis":

            badge.className =
            "px-5 py-3 rounded-full bg-cyan-500/20 text-cyan-300 font-bold";

            badge.innerHTML =
            "📄 HRMIS";

        break;

        case "leave":

            badge.className =
            "px-5 py-3 rounded-full bg-red-500/20 text-red-300 font-bold";

            badge.innerHTML =
            "🌴 Cuti";

        break;

        default:

            badge.className =
            "px-5 py-3 rounded-full bg-slate-500/20 text-slate-300 font-bold";

            badge.innerHTML =
            "⚪ Tidak Diketahui";

    }

}

onSnapshot(staffRef,(snapshot)=>{

    staffCache=[];

    snapshot.forEach(doc=>{

        staffCache.push({

            uid:doc.id,

            ...doc.data()

        });

    });

    refreshRealtimeDashboard();

});

onSnapshot(usersRef,(snapshot)=>{

    usersCache=[];

    snapshot.forEach(doc=>{

        usersCache.push({

            uid:doc.id,

            ...doc.data()

        });

    });

    refreshRealtimeDashboard();

});