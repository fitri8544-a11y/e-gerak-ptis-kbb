/* ======================================================
   E-GERAK PTIS KBB V2
   DASHBOARD.JS (REALTIME)
====================================================== */

import { db } from "./firebase.js";

import {

    collection,
    onSnapshot

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


/* ================= REALTIME ================= */

onSnapshot(

    collection(db,"users"),

    (snapshot)=>{

        let total = 0;

        let online = 0;

        let office = 0;

        let outside = 0;

        let leave=0;

        let task=0;

        let today=0;

        const zoneData={};

        Object.keys(zones).forEach(zone=>{

            zoneData[zone]={

                ahli:0,
                office:0,
                movement:0

            };

        });


        snapshot.forEach(doc=>{

            const user=doc.data();

            total++;

            const status = user.currentStatus || "";

            if(user.online){

                online++;

            }

            const zone=user.zone || "";

            if(zoneData[zone]){

                zoneData[zone].ahli++;

            }

            switch(status){

                case "office":

                    office++;

                    if(zoneData[zone])
                    zoneData[zone].office++;

                    break;

                case "outsideSchool":

                case "meeting":

                case "course":

                case "hrmis":

                    outside++;
                    task++;
                    today++;

                    if(zoneData[zone])
                    zoneData[zone].movement++;

                    break;

                case "leave":

                    leave++;

                    break;

            }

        });


        /* KPI */

        if(totalMembers)
        totalMembers.textContent = total;

        if(onlineMembers)
        onlineMembers.textContent = online;

        if(officeMembers)
        officeMembers.textContent = office;

        if(activeMovement)
        activeMovement.textContent = outside;

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


        /* ZONE */

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

                const percent=
                data.ahli===0
                ?0
                :(data.office/data.ahli)*100;

                card.progress.style.width=
                percent+"%";

            }

        });

    }

);