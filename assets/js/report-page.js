/* ======================================================
   E-GERAK PTIS KBB V2
   REPORT PAGE
====================================================== */

import { db } from "./firebase.js";

import {

    collection,
    getDocs,
    query,
    orderBy

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

/* ======================================================
   DOM
====================================================== */

const printDate =
document.getElementById("printDate");

const printTime =
document.getElementById("printTime");

const totalRecord =
document.getElementById("totalRecord");

const officeTotal =
document.getElementById("officeTotal");

const outsideTotal =
document.getElementById("outsideTotal");

const meetingTotal =
document.getElementById("meetingTotal");

const courseTotal =
document.getElementById("courseTotal");

const leaveTotal =
document.getElementById("leaveTotal");

const hrmisTotal =
document.getElementById("hrmisTotal");

const reportTable =
document.getElementById("reportTable");

/* ======================================================
   SUMMARY
====================================================== */

let summary = {

    total:0,

    office:0,

    outside:0,

    meeting:0,

    course:0,

    leave:0,

    hrmis:0

};

/* ======================================================
   DATE
====================================================== */

function updatePrintInfo(){

    const now =
    new Date();

    printDate.textContent =
    now.toLocaleDateString(
        "ms-MY",
        {
            day:"2-digit",
            month:"long",
            year:"numeric"
        }
    );

    printTime.textContent =
    now.toLocaleTimeString(
        "ms-MY",
        {
            hour:"2-digit",
            minute:"2-digit"
        }
    );

}

/* ======================================================
   STATUS COLOR
====================================================== */

function badge(status){

    switch(status){

        case "office":

            return "Dalam Pejabat";

        case "outsideSchool":

            return "Luar Pejabat";

        case "meeting":

            return "Mesyuarat";

        case "course":

            return "Kursus";

        case "leave":

            return "Cuti";

        case "hrmis":

            return "HRMIS";

        default:

            return "-";

    }

}

/* ======================================================
   INIT
====================================================== */

updatePrintInfo();

loadReport();

/* ======================================================
   LOAD REPORT
====================================================== */

async function loadReport(){

    try{

        const q =
        query(

            collection(db,"movements"),

            orderBy("createdAt","desc")

        );

        const snapshot =
        await getDocs(q);

        reportTable.innerHTML = "";

        // Reset summary
        summary.total = 0;
        summary.office = 0;
        summary.outside = 0;
        summary.meeting = 0;
        summary.course = 0;
        summary.leave = 0;
        summary.hrmis = 0;

        let bil = 1;

        snapshot.forEach(doc=>{

            const data =
            doc.data();

            summary.total++;

            switch(data.type){

                case "office":
                    summary.office++;
                    break;

                case "outsideSchool":
                    summary.outside++;
                    break;

                case "meeting":
                    summary.meeting++;
                    break;

                case "course":
                    summary.course++;
                    break;

                case "leave":
                    summary.leave++;
                    break;

                case "hrmis":
                    summary.hrmis++;
                    break;

            }

            reportTable.innerHTML += `

            <tr>

                <td>${bil++}</td>

                <td>${data.name || "-"}</td>

                <td>${badge(data.type)}</td>

                <td>${data.location || "-"}</td>

                <td>${data.date || "-"}</td>

                <td>${data.time || "-"}</td>

                <td>${data.activity || "-"}</td>

                <td>${data.note || "-"}</td>

            </tr>

            `;

        });

        updateSummary();

    }

    catch(error){

        console.error(
            "Load report error:",
            error
        );

        reportTable.innerHTML = `

        <tr>

            <td colspan="8"
            style="text-align:center;color:red;padding:30px;">

                Gagal memuatkan laporan.

            </td>

        </tr>

        `;

    }

}

/* ======================================================
   UPDATE SUMMARY
====================================================== */

function updateSummary(){

    totalRecord.textContent =
    summary.total;

    officeTotal.textContent =
    summary.office;

    outsideTotal.textContent =
    summary.outside;

    meetingTotal.textContent =
    summary.meeting;

    courseTotal.textContent =
    summary.course;

    leaveTotal.textContent =
    summary.leave;

    hrmisTotal.textContent =
    summary.hrmis;

}

/* ======================================================
   PRINT MODE
====================================================== */

const params =
new URLSearchParams(
    window.location.search
);

const mode =
params.get("mode");

/* ======================================================
   AUTO PRINT
====================================================== */

window.addEventListener("load",()=>{

    if(mode==="print"){

        setTimeout(()=>{

            window.print();

        },800);

    }

});

/* ======================================================
   AFTER PRINT
====================================================== */

window.addEventListener("afterprint",()=>{

    if(mode==="print"){

        window.close();

    }

});

/* ======================================================
   PDF MODE
====================================================== */

if(mode==="pdf"){

    document.title =
    "Laporan Pergerakan PTIS";

}

/* ======================================================
   FUTURE FILTER SUPPORT
====================================================== */

window.reloadReport =
function(){

    loadReport();

};

/* ======================================================
   TOOLBAR
====================================================== */

const backBtn =
document.getElementById("backBtn");

const printBtn =
document.getElementById("printBtn");

backBtn?.addEventListener("click",()=>{

    window.close();

    setTimeout(()=>{

        history.back();

    },200);

});

printBtn?.addEventListener("click",()=>{

    window.print();

});