/* =========================================================
   E-GERAK PTIS KBB V2
   STAFF MANAGEMENT
   VERSION 1.0
   Last Update : 24 Julai 2026
========================================================= */

import{
    db,
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    getDoc,
    getDocs,
    doc,
    query,
    orderBy,
    onSnapshot
}from "./firebase.js";

/* =========================================================
   GLOBAL
========================================================= */

let staffList = [];
let unsubscribeStaff = null;
let editingId = null;
let loadingStaff = true;

/* ================= PAGINATION ================= */

let currentPage = 1;

const rowsPerPage = 10;

/* =========================================================
   ELEMENT
========================================================= */

const table =
document.getElementById("staffTable");

const totalStaff =
document.getElementById("totalStaff");

const activeStaff =
document.getElementById("activeStaff");

const adminStaff =
document.getElementById("adminStaff");

const userStaff =
document.getElementById("userStaff");

const searchInput =
document.getElementById("searchStaff");

const addStaffBtn =
document.getElementById("addStaffBtn");

const saveStaffBtn =
document.getElementById("saveStaffBtn");

const closeStaffModal =
document.getElementById("closeStaffModal");

const staffModal =
document.getElementById("staffModal");

const importBtn =
document.getElementById("importExcelBtn");

const exportBtn =
document.getElementById("exportExcelBtn");

const excelFile =
document.getElementById("excelFile");

/* =========================================================
   TOAST
========================================================= */

function showToast(message,type="success"){

    let toast =
    document.getElementById("staffToast");

    if(!toast){

        toast =
        document.createElement("div");

        toast.id =
        "staffToast";

        toast.className =
        "fixed top-6 right-6 z-[9999] px-5 py-3 rounded-xl shadow-xl text-white font-semibold";

        document.body.appendChild(toast);

    }

    toast.classList.remove(
        "bg-green-600",
        "bg-red-600",
    );

    toast.classList.add(
        type==="success"
        ? "bg-green-600"
        : "bg-red-600"
    );

    toast.textContent =
    message;

}

/* =========================================================
   MODAL
========================================================= */

function openModal(){

    if(!staffModal) return;

    staffModal.classList.remove("hidden");

    staffModal.classList.add("flex");

}

function closeModal(){

    if(!staffModal) return;

    staffModal.classList.remove("flex");

    staffModal.classList.add("hidden");

}

function clearForm(){

    editingId = null;

    document.getElementById("staffNama").value="";
    document.getElementById("staffEmail").value="";
    document.getElementById("staffZone").value="";
    document.getElementById("staffRole").value="user";
    document.getElementById("staffStatus").value="aktif";

}

/* =========================================================
   BUTTON
========================================================= */

if(addStaffBtn){

    addStaffBtn.onclick=()=>{

        clearForm();

        openModal();

    };

}

if(closeStaffModal){

    closeStaffModal.onclick=()=>{

        closeModal();

    };

}

/* =========================================================
   SAVE STAFF
========================================================= */

if(saveStaffBtn){

    saveStaffBtn.onclick = saveStaff;

}

async function saveStaff(){

    const nama =
    document.getElementById("staffNama").value.trim();

    const email =
    document.getElementById("staffEmail").value.trim().toLowerCase();

    const zone =
    document.getElementById("staffZone").value.trim();

    const role =
    document.getElementById("staffRole").value;

    const status =
    document.getElementById("staffStatus").value;

    if(
        nama === "" ||
        email === ""
    ){

        showToast(
            "Nama dan Email wajib diisi.",
            "error"
        );

        return;

    }

    const payload={

        nama,
        email,
        zone,
        role,
        status,
        updatedAt:new Date()

    };

    try{

        if(editingId){

            await updateDoc(

                doc(
                    db,
                    "staff",
                    editingId
                ),

                payload

            );

            showToast(
                "Maklumat staff berjaya dikemaskini."
            );

        }else{

            await addDoc(

                collection(
                    db,
                    "staff"
                ),

                {

                    ...payload,

                    createdAt:new Date()

                }

            );

            showToast(
                "Staff berjaya ditambah."
            );

        }

        closeModal();

        clearForm();

    }

    catch(error){

        console.error(error);

        showToast(
            error.message,
            "error"
        );

    }

}

/* =========================================================
   LOAD STAFF
========================================================= */

function loadStaff(){

    loadingStaff = true;

    renderLoading();

    if(unsubscribeStaff){

        unsubscribeStaff();

    }

    const q = query(

        collection(
            db,
            "staff"
        ),

        orderBy(
            "nama"
        )

    );

    unsubscribeStaff =
    onSnapshot(

        q,

        snapshot=>{

            staffList=[];

            snapshot.forEach(doc=>{

                staffList.push({

                    id:doc.id,

                    ...doc.data()

                });

            });

            loadingStaff = false;

            renderStaff(
                staffList
            );

            updateKPI(
                staffList
            );

        }

    );

}

/* =========================================================
   KPI
========================================================= */

function updateKPI(data){

    if(totalStaff){

        totalStaff.textContent =
        data.length;

    }

    if(activeStaff){

        activeStaff.textContent =

        data.filter(item=>

            item.status==="aktif"

        ).length;

    }

    if(adminStaff){

        adminStaff.textContent =

        data.filter(item=>

            item.role==="admin"

        ).length;

    }

    if(userStaff){

        userStaff.textContent =

        data.filter(item=>

            item.role!=="admin"

        ).length;

    }

}

/* =========================================================
   LOADING SKELETON
========================================================= */

function renderLoading(){

    if(!table) return;

    table.innerHTML = "";

    for(let i=0;i<6;i++){

        table.innerHTML += `

        <tr class="border-b border-slate-200">

            <td class="px-5 py-4">

                <div class="h-4 w-40 rounded bg-slate-200"></div>

            </td>

            <td class="px-5 py-4">

                <div class="h-4 w-52 rounded bg-slate-200"></div>

            </td>

            <td class="px-5 py-4">

                <div class="h-4 w-28 rounded bg-slate-200"></div>

            </td>

            <td class="px-5 py-4">

                <div class="h-6 w-20 rounded-full bg-slate-200"></div>

            </td>

            <td class="px-5 py-4">

                <div class="flex justify-center gap-2">

                    <div class="w-8 h-8 rounded-lg bg-slate-200"></div>

                    <div class="w-8 h-8 rounded-lg bg-slate-200"></div>

                </div>

            </td>

        </tr>

        `;

    }

}

/* =========================================================
   PAGINATION
========================================================= */

function paginate(data){

    const start =

    (currentPage - 1) * rowsPerPage;

    const end =

    start + rowsPerPage;

    return data.slice(start,end);

}

/* =========================================================
   RENDER TABLE
========================================================= */

function renderStaff(data){

    if(!table) return;

    table.innerHTML = "";

    const pageData =
    paginate(data);

    if(data.length===0){

        table.innerHTML=`

        <tr>

            <td
            colspan="5"
            class="py-10 text-center text-slate-400">

                Tiada data staff.

            </td>

        </tr>

        `;

        return;

    }

    pageData.forEach(item=>{

        table.innerHTML += `

<tr class="border-b border-slate-200">

    <td class="px-5 py-4 font-semibold">

        ${item.nama || "-"}

    </td>

    <td class="px-5 py-4">

        ${item.email || "-"}

    </td>

    <td class="px-5 py-4">

        ${item.zone || "-"}

    </td>

    <td class="px-5 py-4">

        <span class="
        inline-flex
        px-3
        py-1
        rounded-full
        bg-blue-100
        text-blue-700
        text-xs
        font-semibold">

            ${item.role || "user"}

        </span>

    </td>

    <td class="px-5 py-4 text-center">

        <button
            class="editBtn text-blue-600 rounded-lg p-2"
            data-id="${item.id}">

            <i class="fa-solid fa-pen"></i>

        </button>

        <button
            class="deleteBtn text-red-600 rounded-lg p-2 ml-2"
            data-id="${item.id}">

            <i class="fa-solid fa-trash"></i>

        </button>

    </td>

</tr>

`;

    });

    renderPagination(data.length);

}

/* =========================================================
   PAGINATION UI
========================================================= */

function renderPagination(totalRows){

    const container =
    document.getElementById("staffPagination");

    if(!container) return;

    container.innerHTML = "";

    const totalPages =
    Math.ceil(totalRows / rowsPerPage);

    if(totalPages <= 1){

        return;

    }

    // Previous

    const prev =
    document.createElement("button");

    prev.textContent = "←";

    prev.className =
    "px-3 py-2 rounded bg-slate-200 hover:bg-slate-300";

    prev.disabled =
    currentPage===1;

    prev.onclick=()=>{

        currentPage--;

        renderStaff(staffList);

    };

    container.appendChild(prev);

    // Number

    for(let i=1;i<=totalPages;i++){

        const btn =
        document.createElement("button");

        btn.textContent=i;

        btn.className=

        i===currentPage

        ? "px-3 py-2 rounded bg-blue-600 text-white"

        : "px-3 py-2 rounded bg-slate-200 hover:bg-slate-300";

        btn.onclick=()=>{

            currentPage=i;

            renderStaff(staffList);

        };

        container.appendChild(btn);

    }

    // Next

    const next =
    document.createElement("button");

    next.textContent="→";

    next.className=
    "px-3 py-2 rounded bg-slate-200 hover:bg-slate-300";

    next.disabled=
    currentPage===totalPages;

    next.onclick=()=>{

        currentPage++;

        renderStaff(staffList);

    };

    container.appendChild(next);

}

/* =========================================================
   SEARCH
========================================================= */

if(searchInput){

    searchInput.addEventListener("input",()=>{

        const keyword =
        searchInput.value
        .toLowerCase()
        .trim();

        if(keyword===""){

            renderStaff(staffList);

            return;

        }

        const result =
        staffList.filter(item=>{

            return(

                (item.nama||"")
                .toLowerCase()
                .includes(keyword)

                ||

                (item.email||"")
                .toLowerCase()
                .includes(keyword)

                ||

                (item.zone||"")
                .toLowerCase()
                .includes(keyword)

                ||

                (item.role||"")
                .toLowerCase()
                .includes(keyword)

                ||

                (item.status||"")
                .toLowerCase()
                .includes(keyword)

            );

        });

        renderStaff(result);

    });

}

/* =========================================================
   EDIT
========================================================= */

document.addEventListener("click",async(e)=>{

    const btn =
    e.target.closest(".editBtn");

    if(!btn) return;

    editingId =
    btn.dataset.id;

    try{

        const snap =
        await getDoc(

            doc(
                db,
                "staff",
                editingId
            )

        );

        if(!snap.exists()){

            showToast(
                "Maklumat staff tidak dijumpai.",
                "error"
            );

            return;

        }

        const data =
        snap.data();

        document.getElementById("staffNama").value =
        data.nama || "";

        document.getElementById("staffEmail").value =
        data.email || "";

        document.getElementById("staffZone").value =
        data.zone || "";

        document.getElementById("staffRole").value =
        data.role || "user";

        document.getElementById("staffStatus").value =
        data.status || "aktif";

        openModal();

    }

    catch(error){

        console.error(error);

        showToast(
            error.message,
            "error"
        );

    }

});

/* =========================================================
   DELETE
========================================================= */

document.addEventListener("click",async(e)=>{

    const btn =
    e.target.closest(".deleteBtn");

    if(!btn) return;

    const id =
    btn.dataset.id;

    if(
        !confirm(
            "Padam staff ini?"
        )
    ){

        return;

    }

    try{

        await deleteDoc(

            doc(
                db,
                "staff",
                id
            )

        );

        showToast(
            "Staff berjaya dipadam."
        );

    }

    catch(error){

        console.error(error);

        showToast(
            error.message,
            "error"
        );

    }

});

/* =========================================================
   IMPORT EXCEL
========================================================= */

if(importBtn && excelFile){

    importBtn.onclick = ()=>{

        excelFile.value = "";

        excelFile.click();

    };

    excelFile.addEventListener(
        "change",
        importExcel
    );

}

async function importExcel(e){

    if(typeof XLSX==="undefined"){

        showToast(
            "Library XLSX belum dimuatkan.",
            "error"
        );

        return;

    }

    const file =
    e.target.files[0];

    if(!file) return;

    const reader =
    new FileReader();

    reader.onload =
    async(event)=>{

        try{

            const workbook =
            XLSX.read(

                new Uint8Array(
                    event.target.result
                ),

                {
                    type:"array"
                }

            );

            const sheet =
            workbook.Sheets[
                workbook.SheetNames[0]
            ];

            const rows =
            XLSX.utils.sheet_to_json(

                sheet,

                {

                    range:4

                }

);

            await bulkUpload(rows);

        }

        catch(error){

            console.error(error);

            showToast(
                error.message,
                "error"
            );

        }

    };

    reader.readAsArrayBuffer(file);

}

/* =========================================================
   BULK UPLOAD
========================================================= */

async function bulkUpload(rows){

    showToast(
        "Import sedang dijalankan..."
    );

    const snapshot =
    await getDocs(

        collection(
            db,
            "staff"
        )

    );

    const existingEmails =
    new Set();

    snapshot.forEach(doc=>{

        existingEmails.add(

            (doc.data().email || "")
            .toLowerCase()
            .trim()

        );

    });

    let success = 0;

    let duplicate = 0;

    for(const row of rows){

        const nama =

        row.nama ||
        row.Nama ||
        row.NAMA ||
        "";

        const email =

        (
        row.email ||
        row.Email ||
        row.EMAIL ||
        ""
        )
        .toLowerCase()
        .trim();


        const zone =

        row.zone ||
        row.Zone ||
        row.ZONE ||
        row["LOKASI PENUGASAN"] ||
        "";

        const role =

        row.role ||
        row.Role ||
        row.PERANAN ||
        "user";

        const status =
        row.status ||
        row.Status ||
        "aktif";

        if(
            nama==="" ||
            email===""
        ){

            continue;

        }

        if(
            existingEmails.has(email)
        ){

            duplicate++;

            continue;

        }

        await addDoc(

            collection(
                db,
                "staff"
            ),

            {

                nama,
                email,
                zone,
                role,
                status,
                createdAt:new Date(),
                updatedAt:new Date()

            }

        );

        existingEmails.add(email);

        success++;

    }

    showToast(

        `Import selesai

${success} berjaya

${duplicate} duplicate`

    );

}

/* =========================================================
   EXPORT EXCEL
========================================================= */

if(exportBtn){

    exportBtn.onclick =
    exportExcel;

}

function exportExcel(){

    if(typeof XLSX==="undefined"){

        showToast(
            "Library XLSX belum dimuatkan.",
            "error"
        );

        return;

    }

    const rows =

    staffList.map(item=>({

        Nama:item.nama,

        Email:item.email,

        Zone:item.zone,

        Role:item.role,

        Status:item.status

    }));

    const worksheet =
    XLSX.utils.json_to_sheet(
        rows
    );

    const workbook =
    XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(

        workbook,

        worksheet,

        "Staff"

    );

    XLSX.writeFile(

        workbook,

        "PTIS_Staff.xlsx"

    );

}

/* =========================================================
   INITIALIZATION
========================================================= */

loadStaff();

window.addEventListener(

    "keydown",

    (e)=>{

        if(
            e.key==="Escape"
        ){

            closeModal();

        }

    }

);

if(staffModal){

    staffModal.addEventListener(

        "click",

        (e)=>{

            if(
                e.target===staffModal
            ){

                closeModal();

            }

        }

    );

}