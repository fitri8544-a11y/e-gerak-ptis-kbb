/* ======================================================
   E-GERAK PTIS KBB V2
   DASHBOARD.JS (REALTIME)
====================================================== */

import { db } from "./firebase.js";

console.log("Dashboard.js Loaded");

import {

    collection,
    onSnapshot,
    query,
    orderBy,
    limit

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


/* ================= KPI ================= */

const totalMembers =
document.getElementById("totalStaff");

const onlineMembers =
document.getElementById("onlineStaff");

const officeMembers =
document.getElementById("officeStaff");

const activeMovement =
document.getElementById("outsideStaff");

const absentMembers =
document.getElementById("absentMembers");

const totalTasks =
document.getElementById("totalTasks");

const firebaseStatus =
document.getElementById("firebaseStatus");

const systemStatus =
document.getElementById("systemStatus");

const todayMovementTotal =
document.getElementById("todayMovementTotal");


/* ================= ZONE CARD ================= */

const zones = {

    "Padang Serai":{

        ahli:document.getElementById("padangAhli"),
        office:document.getElementById("padangOffice"),
        movement:document.getElementById("padangMovement"),
        progress:document.getElementById("padangProgress")

    },

    "Kulim":{

        ahli:document.getElementById("kulimAhli"),
        office:document.getElementById("kulimOffice"),
        movement:document.getElementById("kulimMovement"),
        progress:document.getElementById("kulimProgress")

    },

    "Sungai Ular":{

        ahli:document.getElementById("sungaiAhli"),
        office:document.getElementById("sungaiOffice"),
        movement:document.getElementById("sungaiMovement"),
        progress:document.getElementById("sungaiProgress")

    },

    "Bandar Baharu":{

        ahli:document.getElementById("bbAhli"),
        office:document.getElementById("bbOffice"),
        movement:document.getElementById("bbMovement"),
        progress:document.getElementById("bbProgress")

    },

    "Serdang":{

        ahli:document.getElementById("serdangAhli"),
        office:document.getElementById("serdangOffice"),
        movement:document.getElementById("serdangMovement"),
        progress:document.getElementById("serdangProgress")

    }

};

/* ================= DATA CACHE ================= */

let staffList = [];

let userStatus = [];

let movementList = [];

/* ================= COORDINATOR ================= */

const coordinatorEmail =
"muhammadkhalid@moe.gov.my";

let coordinatorData = null;

/* ======================================================
   DASHBOARD ENGINE V2
====================================================== */

function normalizeZone(zone){

    switch((zone || "").toUpperCase()){

        case "PKG PADANG SERAI":
            return "Padang Serai";

        case "PKG KULIM":
            return "Kulim";

        case "PKG SUNGAI ULAR":
            return "Sungai Ular";

        case "PKG BANDAR BAHARU":
            return "Bandar Baharu";

        case "PKG SERDANG":
            return "Serdang";

        default:
            return zone;

    }

}

function refreshDashboard(){

    let total = 0;
    let online = 0;
    let office = 0;
    let outside = 0;
    let leave = 0;
    let task = 0;
    let today = 0;

    const zoneData = {};

    Object.keys(zones).forEach(zone=>{

        zoneData[zone]={

            ahli:0,
            office:0,
            movement:0

        };

    });

    /* ================= STAFF ================= */

    staffList.forEach(staff=>{

        console.log(
            staff.nama,
            staff.status,
            staff.zone
        );

        total++;

        const zone =
        normalizeZone(staff.zone);

        if(zoneData[zone]){

            zoneData[zone].ahli++;

        }

        switch(staff.status){

            case "bertugas":

                outside++;
                task++;
                today++;

                if(zoneData[zone]){

                    zoneData[zone].movement++;

                }

                break;

            case "pejabat":

            case "office":

                office++;

                if(zoneData[zone]){

                    zoneData[zone].office++;

                }

                break;

            case "cuti":

            case "leave":

                leave++;

                break;

        }

    });

    /* ================= USERS ================= */

    userStatus.forEach(user=>{

        if(user.online){

            online++;

        }

    });

    /* ================= KPI ================= */

    if(totalMembers)
    totalMembers.textContent=total;

    const directoryTotal =
    document.getElementById(
        "directoryTotal"
    );

    if(directoryTotal){

        directoryTotal.textContent =
        total;

    }

    if(onlineMembers)
    onlineMembers.textContent=online;

    if(officeMembers)
    officeMembers.textContent=office;

    if(activeMovement)
    activeMovement.textContent=outside;

    if(absentMembers)
    absentMembers.textContent=leave;

    if(totalTasks)
    totalTasks.textContent=task;

    if(todayMovementTotal)
    todayMovementTotal.textContent=today;

    if(firebaseStatus)
    firebaseStatus.textContent="ONLINE";

    if(systemStatus)
    systemStatus.textContent="CONNECTED";

    /* ================= ZONE ================= */

    Object.keys(zoneData).forEach(zone=>{

        const card=zones[zone];

        if(!card) return;

        const data=zoneData[zone];

        if(card.ahli)
        card.ahli.textContent=data.ahli;

        if(card.office)
        card.office.textContent=data.office;

        if(card.movement)
        card.movement.textContent=data.movement;

        if(card.progress){

            const percent =
            data.ahli===0
            ?0
            :(data.office/data.ahli)*100;

            card.progress.style.width=
            percent+"%";

        }

    });

}

/*======================================================
  RENDER COORDINATOR
======================================================*/

function renderCoordinator(){

    if(!coordinatorData){

        return;

    }

    document.getElementById(
        "coordinatorName"
    ).textContent =
    coordinatorData.nama || "-";

    document.getElementById(
        "coordinatorRole"
    ).textContent =
    coordinatorData.role || "-";

    document.getElementById(
        "coordinatorLocation"
    ).textContent =
    coordinatorData.currentLocation || "-";

    document.getElementById(
        "coordinatorActivity"
    ).textContent =
    coordinatorData.currentActivity || "-";

    const badge =
    document.getElementById(
        "coordinatorBadge"
    );

    const status =
    coordinatorData.currentStatus || "office";

    badge.className =
    "px-5 py-3 rounded-full font-bold";

    switch(status){

        case "office":

            badge.classList.add(

                "bg-green-500/20",

                "text-green-300"

            );

            badge.textContent =
            "🟢 Dalam Pejabat";

            break;

        case "outsideSchool":

            badge.classList.add(

                "bg-yellow-500/20",

                "text-yellow-300"

            );

            badge.textContent =
            "🚗 Keluar Bertugas";

            break;

        case "meeting":

            badge.classList.add(

                "bg-blue-500/20",

                "text-blue-300"

            );

            badge.textContent =
            "👥 Mesyuarat";

            break;

        case "course":

            badge.classList.add(

                "bg-purple-500/20",

                "text-purple-300"

            );

            badge.textContent =
            "🎓 Berkursus";

            break;

        case "leave":

            badge.classList.add(

                "bg-red-500/20",

                "text-red-300"

            );

            badge.textContent =
            "🌴 Cuti";

            break;

        case "hrmis":

            badge.classList.add(

                "bg-cyan-500/20",

                "text-cyan-300"

            );

            badge.textContent =
            "📄 HRMIS";

            break;

    }

    if(

        coordinatorData.updatedAt?.toDate

    ){

        document.getElementById(

            "coordinatorTime"

        ).textContent =

        coordinatorData.updatedAt

        .toDate()

        .toLocaleString("ms-MY");

    }

}

/* ================= STAFF ================= */

onSnapshot(

    collection(db,"staff"),

    snapshot=>{

        staffList = [];

        coordinatorData = null;

        snapshot.forEach(doc=>{

            const data = {

                id: doc.id,

                ...doc.data()

            };

            staffList.push(data);

            if(

                (data.email || "").toLowerCase() ===

                coordinatorEmail.toLowerCase()

            ){

                coordinatorData = data;

            }

        });

        refreshDashboard();

        renderCoordinator();

    }

);

/* ================= USERS ================= */

onSnapshot(

    collection(db,"users"),

    snapshot=>{

        userStatus=[];

        snapshot.forEach(doc=>{

            userStatus.push({

                id:doc.id,

                ...doc.data()

            });

        });

        refreshDashboard();

    }

);

/* ================= MOVEMENTS ================= */

onSnapshot(

    collection(db,"movements"),

    snapshot=>{

        movementList=[];

        snapshot.forEach(doc=>{

            movementList.push({

                id:doc.id,

                ...doc.data()

            });

        });

        refreshDashboard();

    }

);


/* ======================================================
   DIRECTORY SHORTCUT
====================================================== */

const directoryCard =
document.getElementById(
    "directoryCard"
);

if(directoryCard){

    directoryCard.addEventListener(

        "click",

        ()=>{

            window.location.href =
            "directory.html";

        }

    );

}