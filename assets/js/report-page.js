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
            timeZone:"Asia/Kuala_Lumpur",
            day:"2-digit",
            month:"long",
            year:"numeric"
        }
    );

    printTime.textContent =
    now.toLocaleTimeString(
        "ms-MY",
        {
            timeZone:"Asia/Kuala_Lumpur",
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

// Pastikan jadual dan ringkasan menggunakan set rekod yang sama.
const mode = new URLSearchParams(location.search).get("mode");
const isPrintMode = mode === "print";
const printBtn = document.getElementById("printBtn");
const backBtn = document.getElementById("backBtn");
let canPrint = false;

function setPrintable(value) {
    canPrint = value;
    printBtn.disabled = !value;
}

function showMessage(message) {
    const row = reportTable.insertRow();
    const cell = row.insertCell();
    cell.colSpan = 8;
    cell.style.cssText = "text-align:center;padding:24px";
    cell.textContent = message;
}

function resetReport() {
    reportTable.replaceChildren();
    for (const key of Object.keys(summary)) summary[key] = 0;
    const totals = [totalRecord, officeTotal, outsideTotal, meetingTotal,
        courseTotal, leaveTotal, hrmisTotal];
    totals.forEach((element, index) => {
        element.textContent = Object.values(summary)[index];
    });
    setPrintable(false);
}

const formatLabel = date => date.split("-").reverse().join("/");
let period;
const memberName = value => typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
const memberKey = value => memberName(value).toLocaleLowerCase("ms-MY");
function fetchMovements() {
    return getDocs(query(collection(db, "movements"), orderBy("createdAt", "desc")));
}
let requestNumber = 0;

async function loadReport(range) {
    const request = ++requestNumber;
    resetReport();
    if (period) period.textContent =
        `Tempoh laporan: ${formatLabel(range.start)} hingga ${formatLabel(range.end)} · Ahli PTIS: ${range.memberLabel}`;
    showMessage("Memuatkan laporan...");
    try {
        const snapshot = await fetchMovements();
        if (request !== requestNumber) return;
        const records = snapshot.docs.map(doc => doc.data()).filter(data =>
            !range || (typeof data.date === "string" &&
                /^\d{4}-\d{2}-\d{2}$/.test(data.date) &&
                data.date >= range.start && data.date <= range.end &&
                (!range.member || memberKey(data.name) === range.member)));

        reportTable.replaceChildren();
        const groups = new Map([
            ["office", "office"], ["outsideSchool", "outside"],
            ["meeting", "meeting"], ["course", "course"],
            ["leave", "leave"], ["hrmis", "hrmis"]
        ]);
        records.forEach((data, index) => {
            summary.total++;
            const group = groups.get(data.type);
            if (group) summary[group]++;
            const row = reportTable.insertRow();
            [index + 1, data.name, badge(data.type), data.location, data.date,
                data.time, data.activity, data.note].forEach(value => {
                row.insertCell().textContent = value ?? "-";
            });
        });

        totalRecord.textContent = summary.total;
        officeTotal.textContent = summary.office;
        outsideTotal.textContent = summary.outside;
        meetingTotal.textContent = summary.meeting;
        courseTotal.textContent = summary.course;
        leaveTotal.textContent = summary.leave;
        hrmisTotal.textContent = summary.hrmis;
        if (!records.length) {
            showMessage(range ? "Tiada rekod pergerakan yang sepadan dengan pilihan ini." : "Tiada rekod pergerakan.");
            return;
        }
        updatePrintInfo();
        setPrintable(true);
    } catch (error) {
        if (request !== requestNumber) return;
        console.error("Load report error:", error);
        resetReport();
        showMessage("Gagal memuatkan laporan. Sila cuba semula.");
    }
}

printBtn.addEventListener("click", () => {
    if (!canPrint) return;
    updatePrintInfo();
    window.print();
});

backBtn?.addEventListener("click", () => {
    window.close();
    setTimeout(() => { location.href = "menuadmin.html"; }, 200);
});

updatePrintInfo();
resetReport();

if (isPrintMode) {
    const form = document.createElement("form");
    const style = document.createElement("style");
    style.textContent = `
        .report-date-filter {
            box-sizing: border-box; margin: 0 0 20px; padding: 22px 24px;
            background: linear-gradient(125deg, #fff 55%, #eff6ff);
            border: 1px solid #dbe6f5; border-radius: 18px;
            box-shadow: 0 6px 18px #1725540d; color: #0f172a;
        }
        .report-date-filter h2 { margin: 0; font-size: 1.1rem; }
        .report-date-filter p { margin: 5px 0 16px; color: #475569; font-size: .88rem; }
        .report-date-fields {
            display: grid; gap: 12px;
            grid-template-columns: repeat(2, minmax(0, 1fr)) auto; align-items: end;
        }
        .report-date-fields label { display: grid; gap: 6px; font-size: .85rem; font-weight: 600; }
        .report-date-fields input, .report-member-filter select {
            box-sizing: border-box; width: 100%; min-width: 0; min-height: 44px;
            padding: 8px 12px; border: 1px solid #b9cbe4; border-radius: 10px;
            color: #0f172a; background: #fff; font: inherit;
        }
        .report-member-filter select:focus-visible, .report-date-fields input:focus-visible, .report-date-presets button:focus-visible {
            outline: 2px solid #2563eb; outline-offset: 2px;
        }
        .report-date-presets { display: flex; flex-wrap: wrap; align-items: end; gap: 8px; margin-top: 14px; }
        .report-date-presets button {
            border: 1px solid #bfdbfe; border-radius: 999px; padding: 7px 13px;
            font: inherit; font-size: .8rem; font-weight: 600;
            color: #1e40af; background: #eff6ff; cursor: pointer;
        }
        .report-member-filter {
            display: grid; gap: 6px; flex: 0 1 360px;
            font-size: .85rem; font-weight: 600; min-width: 0;
        }
        .report-member-status { font-size: .8rem; color: #475569; }
        .report-date-presets button:hover { background: #dbeafe; }
        .report-date-period:not(:empty) {
            padding: 9px 13px; margin: 0 0 12px; border-left: 3px solid #2563eb;
            background: #eff6ff; color: #1e3a8a; font-size: .88rem;
        }
        .report-date-period:empty { display: none; }
        @media (max-width: 620px) {
            .report-date-filter { padding: 16px; }
            .report-date-fields > button { grid-column: 1 / -1; }
        }
        @media (max-width: 360px) {
            .report-date-fields { grid-template-columns: minmax(0, 1fr); }
        }
        @media print {
            .report-date-filter { display: none !important; }
            .report-date-period:not(:empty) { background: transparent; }
        }
    `;
    document.head.append(style);
    form.className = "report-date-filter";
    form.setAttribute("aria-labelledby", "reportDateHeading");
    form.innerHTML = `
        <h2 id="reportDateHeading">📅 Tempoh Laporan</h2>
        <p>Pilih julat tarikh untuk melihat rekod sebelum mencetak.</p>
        <div class="report-date-fields">
            <label>Tarikh Mula<input type="date" name="mula" required></label>
            <label>Tarikh Akhir<input type="date" name="akhir" required></label>
            <button type="submit" class="toolbar-btn primary">Papar Laporan</button>
        </div>
        <div class="report-date-presets">
            <button type="button" data-range="today">Hari Ini</button>
            <button type="button" data-range="month">Bulan Ini</button>
            <label class="report-member-filter">Nama Ahli PTIS
                <select name="ahli" aria-describedby="reportMemberStatus" disabled>
                    <option value="">Semua ahli PTIS</option>
                </select>
            </label>
            <span id="reportMemberStatus" class="report-member-status" role="status">Memuatkan nama ahli…</span>
        </div>
    `;
    printBtn.closest(".report-toolbar").after(form);

    const start = form.elements.mula;
    const end = form.elements.akhir;
    const member = form.elements.ahli;
    const memberStatus = form.querySelector("#reportMemberStatus");
    fetchMovements().then(snapshot => {
        const names = new Map();
        for (const doc of snapshot.docs) {
            const name = memberName(doc.data().name);
            if (name && !names.has(memberKey(name))) names.set(memberKey(name), name);
        }
        for (const [key, name] of [...names].sort((a, b) => a[1].localeCompare(b[1], "ms-MY"))) {
            member.add(new Option(name, key));
        }
        member.disabled = names.size === 0;
        memberStatus.textContent = names.size ? "" : "Tiada nama dalam rekod pergerakan.";
    }).catch(error => {
        console.error("Gagal memuatkan nama ahli:", error);
        memberStatus.textContent = "Senarai nama tidak dapat dimuatkan. Muat semula halaman untuk cuba lagi.";
    });
    form.querySelectorAll("[data-range]").forEach(button => {
        button.addEventListener("click", () => {
            const today = new Intl.DateTimeFormat("sv-SE", {
                timeZone: "Asia/Kuala_Lumpur", year: "numeric", month: "2-digit", day: "2-digit"
            }).format(new Date());
            start.value = button.dataset.range === "month" ? today.slice(0, 8) + "01" : today;
            end.value = today;
            end.setCustomValidity("");
            form.requestSubmit();
        });
    });
    period = document.createElement("p");
    period.className = "report-date-period";
    document.querySelector(".summary-section").before(period);
    showMessage("Pilih julat tarikh dan klik Papar Laporan.");

    form.addEventListener("input", () => {
        end.setCustomValidity("");
        ++requestNumber;
        resetReport();
        period.textContent = "";
        showMessage("Klik Papar Laporan untuk menggunakan julat baharu.");
    });
    form.addEventListener("submit", event => {
        event.preventDefault();
        if (start.value > end.value) {
            end.setCustomValidity("Tarikh Akhir mesti sama atau selepas Tarikh Mula.");
            end.reportValidity();
            return;
        }
        loadReport({
            start: start.value, end: end.value, member: member.value,
            memberLabel: member.selectedOptions[0].textContent
        });
    });
} else {
    loadReport();
    window.reloadReport = () => loadReport();
}
