/* ======================================================
   E-GERAK PTIS KBB V2
   REPORTS.JS
====================================================== */

import {
    db
} from "./firebase.js";

import {

    collection,
    onSnapshot

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const todayMovement =
document.getElementById("todayMovement");

const todayOffice =
document.getElementById("todayOffice");

const todayOutside =
document.getElementById("todayOutside");

const totalMovement =
document.getElementById("totalMovement");

const reportOffice =
document.getElementById("reportOffice");

const reportOutside =
document.getElementById("reportOutside");

const reportMeeting =
document.getElementById("reportMeeting");

const reportCourse =
document.getElementById("reportCourse");

const reportLeave =
document.getElementById("reportLeave");

const reportHrmis =
document.getElementById("reportHrmis");

function formatDate(){

    const d = new Date();

    const year = d.getFullYear();

    const month =
    String(
        d.getMonth()+1
    ).padStart(2,"0");

    const day =
    String(
        d.getDate()
    ).padStart(2,"0");

    return `${year}-${month}-${day}`;

}

const today =
formatDate();

onSnapshot(

    collection(db,"movements"),

    snapshot=>{

        let total=0;

        let todayTotal=0;

        let office=0;

        let outside=0;

        let meeting=0;

        let course=0;

        let leave=0;

        let hrmis=0;

        snapshot.forEach(doc=>{

            total++;

            const data=
            doc.data();

            if(data.date===today){

                todayTotal++;

            }

            switch(data.type){

    case "office":
        office++;
        break;

    case "outsideSchool":
        outside++;
        break;

    case "meeting":
        meeting++;
        break;

    case "course":
        course++;
        break;

    case "leave":
        leave++;
        break;

    case "hrmis":
        hrmis++;
        break;

}

        });

        if(todayMovement)
        todayMovement.textContent=todayTotal;

        if(todayOffice)
        todayOffice.textContent=office;

        if(todayOutside)
        todayOutside.textContent=outside;

        if(totalMovement)
        totalMovement.textContent=total;

        if(reportOffice)
        reportOffice.textContent=office;

        if(reportOutside)
        reportOutside.textContent=outside;

        if(reportMeeting)
        reportMeeting.textContent=meeting;

        if(reportCourse)
        reportCourse.textContent=course;

        if(reportLeave)
        reportLeave.textContent=leave;

        if(reportHrmis)
        reportHrmis.textContent=hrmis;

    }

);

/* ======================================================
   EXPORT PDF
====================================================== */

const exportPdfBtn =
document.getElementById("exportPdfBtn");

exportPdfBtn?.addEventListener("click",()=>{

    window.open(
        "report.html?mode=pdf",
        "_blank"
    );

});


/* ======================================================
   PRINT REPORT
====================================================== */

const printReportBtn =
document.getElementById("printReportBtn");

printReportBtn?.addEventListener("click",()=>{

    window.open(
        "report.html?mode=print",
        "_blank"
    );

});


/* ======================================================
   EXPORT EXCEL
====================================================== */

const exportExcelBtn =
document.getElementById("exportExcelBtn");

exportExcelBtn?.addEventListener("click",()=>{

    const rows = [[

        "Status",
        "Jumlah"

    ]];

    rows.push([
        "Dalam Pejabat",
        reportOffice.textContent
    ]);

    rows.push([
        "Luar Pejabat",
        reportOutside.textContent
    ]);

    rows.push([
        "Mesyuarat",
        reportMeeting.textContent
    ]);

    rows.push([
        "Kursus",
        reportCourse.textContent
    ]);

    rows.push([
        "Cuti",
        reportLeave.textContent
    ]);

    rows.push([
        "HRMIS",
        reportHrmis.textContent
    ]);

    const ws =
    XLSX.utils.aoa_to_sheet(rows);

    const wb =
    XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(

        wb,
        ws,
        "Report"

    );

    XLSX.writeFile(

        wb,
        "PTIS_Report.xlsx"

    );

});