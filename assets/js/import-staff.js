/*======================================================
 PTIS IMPORT STAFF
======================================================*/

import {

    db,

    collection,

    query,

    where,

    getDocs,

    updateDoc,

    doc

} from "./firebase.js";

import { auth } from "./firebase.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

/*======================================================
 GLOBAL
======================================================*/

let excelData = [];

/*======================================================
 ELEMENT
======================================================*/

const fileInput =
document.getElementById("excelFile");

const selectedFile =
document.getElementById("selectedFile");

const previewTable =
document.getElementById("previewTable");

const totalRecord =
document.getElementById("totalRecord");

const importBtn =
document.getElementById("importBtn");

/*======================================================
 AUTH CHECK
======================================================*/

let currentUser = null;

onAuthStateChanged(auth,(user)=>{

    currentUser = user;

    if(user){

        console.log(

            "✅ Login:",

            user.email

        );

    }else{

        console.warn(

            "❌ Tiada pengguna login"

        );

    }

});

/*======================================================
 FILE SELECT
======================================================*/

fileInput.addEventListener(

    "change",

    loadExcel

);

/*======================================================
 LOAD EXCEL
======================================================*/

function loadExcel(event){

    const file =
    event.target.files[0];

    if(!file) return;

    selectedFile.textContent =
    file.name;

    const reader =
    new FileReader();

    reader.onload = function(e){

        const data =
        new Uint8Array(
            e.target.result
        );

        const workbook =
        XLSX.read(data,{
            type:"array"
        });

        const sheet =
        workbook.SheetNames[0];

        const worksheet =
        workbook.Sheets[sheet];

        excelData =
        XLSX.utils.sheet_to_json(
            worksheet,
            {
                defval:""
            }
        );

        console.log(excelData);

console.table(excelData);

console.log(

    "HEADER",

    Object.keys(

        excelData[0]

    )

);

        console.log(
        Object.keys(excelData[0])
        );

        showPreview();

        };

    reader.readAsArrayBuffer(file);

}

/*======================================================
 SHOW PREVIEW
======================================================*/

function showPreview(){

    totalRecord.textContent =
    excelData.length + " Rekod";

    if(excelData.length===0){

        previewTable.innerHTML =
        "<p>Tiada Data</p>";

        return;

    }

    let html = `

<table class="min-w-full text-sm">

<thead>

<tr class="border-b bg-slate-100">

<th class="text-left p-3">
Bil
</th>

<th class="text-left p-3">
Nama
</th>

<th class="text-left p-3">
Role
</th>

<th class="text-left p-3">
Zon
</th>

<th class="text-left p-3">
Sekolah Seliaan
</th>

</tr>

</thead>

<tbody>

`;

    excelData.forEach((row,index)=>{

        const jumlahSekolah =

        row.sekolahSeliaan
        ? row.sekolahSeliaan
            .split(";")
            .filter(x=>x.trim()!=="")
            .length
        : 0;

        html += `

<tr class="border-b hover:bg-slate-50">

<td class="p-3">

${index+1}

</td>

<td class="p-3 font-semibold">

${row.nama || "-"}

</td>

<td class="p-3">

${row.role || "-"}

</td>

<td class="p-3">

${row.zone || "-"}

</td>

<td class="p-3">

${jumlahSekolah} Sekolah

</td>

</tr>

`;

    });

    html += `

</tbody>

</table>

`;

    previewTable.innerHTML = html;

    importBtn.disabled = false;

    importBtn.classList.remove(

        "bg-slate-300",
        "cursor-not-allowed"

    );

    importBtn.classList.add(

        "bg-emerald-600",
        "hover:bg-emerald-700"

    );

}

/*======================================================
 FIND STAFF BY EMAIL
======================================================*/

async function findStaffByEmail(email){

    const q = query(

        collection(db,"staff"),

        where("email","==",email)

    );

    const snapshot = await getDocs(q);

    if(snapshot.empty){

        console.warn(

            "❌ Tidak dijumpai:",

            email

        );

        return null;

    }

    const docSnap = snapshot.docs[0];

    console.log(

        "✅ Rekod dijumpai"

    );

    console.log(

        docSnap.id

    );

    console.log(

        docSnap.data()

    );

    return docSnap;

}

/*======================================================
 UPDATE ONE STAFF
======================================================*/

async function updateOneStaff(staff){

    const docSnap = await findStaffByEmail(

        staff.email

    );

    if(!docSnap){

        return;

    }

    await updateDoc(

        docSnap.ref,

        {

            telefon:

            staff.telefon || "",

            photoURL:

            staff.photoURL || "",

            sekolahSeliaan:

            staff.sekolahSeliaan

            ?

            staff.sekolahSeliaan

                .split(";")

                .map(

                    item=>item.trim()

                )

                .filter(Boolean)

            :

            []

        }

    );

    console.log(

        "✅ Update berjaya:",

        staff.nama

    );

}

/*======================================================
 IMPORT BUTTON
======================================================*/

importBtn.addEventListener(

    "click",

    testImport

);

/*======================================================
 IMPORT ALL STAFF
======================================================*/

async function testImport(){

    if(excelData.length===0){

        alert(

            "Tiada data untuk diimport."

        );

        return;

    }

    if(

        !confirm(

            `Import ${excelData.length} rekod ke Firestore?`

        )

    ){

        return;

    }

    importBtn.disabled = true;

    importBtn.textContent = "SEDANG IMPORT...";

    let success = 0;

    let failed = 0;

    for(const staff of excelData){

        try{

            await updateOneStaff(

                staff

            );

            success++;

        }

        catch(error){

            console.error(

                staff.nama,

                error

            );

            failed++;

        }

    }

    importBtn.textContent =

    "IMPORT SELESAI";

    alert(

`Import selesai.

Berjaya : ${success}

Gagal : ${failed}`

    );

}