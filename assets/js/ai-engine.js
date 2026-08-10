/*======================================================
PTIS AI ENGINE
======================================================*/

console.log("PTIS AI Engine Loaded");

window.staffData = window.staffData || [];

/*======================================================
SEND BUTTON
======================================================*/

const sendButton =
document.getElementById("sendAI");

const input =
document.getElementById("aiInput");

sendButton.onclick = askAI;

input.addEventListener(

    "keypress",

    (e)=>{

        if(e.key==="Enter"){

            askAI();

        }

    }

);

/*======================================================
MAIN
======================================================*/

function askAI(){

    const question =

    input.value.trim();

    if(question==="") return;

    addUserMessage(question);

    input.value="";

    processQuestion(question);

}

/*======================================================
USER MESSAGE
======================================================*/

function addUserMessage(text){

    const messages =
    document.getElementById("aiMessages");

    messages.innerHTML += `

<div class="flex justify-end mb-4">

<div class="bg-cyan-600 text-white rounded-2xl px-4 py-3 max-w-[80%]">

${text}

</div>

</div>

`;

    messages.scrollTop =
    messages.scrollHeight;

}

/*======================================================
AI MESSAGE
======================================================*/

function addAIMessage(text){

    const messages =
    document.getElementById("aiMessages");

    messages.innerHTML += `

<div class="flex mb-4">

<div class="bg-white border border-slate-200 rounded-2xl px-4 py-3 max-w-[80%] shadow">

🤖 ${text}

</div>

</div>

`;

    messages.scrollTop =
    messages.scrollHeight;

}

/*======================================================
QUESTION
======================================================*/

/*======================================================*
* NORMALIZE TEXT
*======================================================*/

function normalizeAIText(text){

    return (text || "")
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s@]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();

}


/*======================================================*
* FIND STAFF BY NAME
*======================================================*/

function findStaffByName(question, staff){

    const q =
        normalizeAIText(question);

    /* Perkataan arahan yang bukan sebahagian nama */

    const stopWords = [

    // Arahan
    "siapa",
    "cari",
    "carikan",
    "tunjuk",
    "tunjukkan",

    // PTIS
    "pegawai",
    "staff",
    "ahli",
    "ptis",
    "jtk",

    // Gelaran
    "encik",
    "cik",
    "puan",

    // Zon
    "dari",
    "daripada",
    "zon",
    "mana",

    // Sekolah / tugasan
    "sekolah",
    "seliaan",
    "selian",
    "selia",
    "jaga",
    "menjaga",
    "bertugas",
    "tugas",
    "di",

    // Pertanyaan
    "maklumat",
    "tentang",
    "apakah",
    "adakah",
    "berapa",
    "jumlah"

];


    const searchWords =
        q.split(" ")
        .filter(word =>
            word.length >= 3 &&
            !stopWords.includes(word)
        );


    if(searchWords.length === 0){

        return [];

    }


    return staff.filter(person => {

        const name =
            normalizeAIText(
                person.name ||
                person.nama ||
                ""
            );


        if(!name){

            return false;

        }


        return searchWords.every(word =>
            name.includes(word)
        );

    });

}

/*======================================================*
* QUESTION PROCESSOR
*======================================================*/

function processQuestion(question){

    const q =
    question
    .toLowerCase()
    .trim();


    /*==================================================
      STAFF DATA
    ==================================================*/

    const staff =
    Array.isArray(window.staffData)
        ? window.staffData
        : [];


    /*==================================================
  GREETING
==================================================*/

const greetingWords = [
    "hai",
    "hi",
    "hello",
    "helo",
    "assalamualaikum",
    "salam"
];

const questionWords =
    q
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);

const isGreeting =
    questionWords.length <= 3 &&
    questionWords.some(word =>
        greetingWords.includes(word)
    );


if(isGreeting){

    addAIMessage(
        "Hai 👋 Saya PTIS AI Assistant. " +
        "Saya boleh membantu mendapatkan maklumat " +
        "berkaitan Staff Directory PTIS."
    );

    return;

}


    /*==================================================
      CHECK STAFF DATA
    ==================================================*/

    if(staff.length === 0){

        addAIMessage(
            "Data Staff Directory masih belum tersedia. " +
            "Sila cuba sebentar lagi."
        );

        return;

    }


    /*==================================================
      JUMLAH AHLI
    ==================================================*/

    if(
        (
            q.includes("berapa ahli") ||
            q.includes("jumlah ahli") ||
            q.includes("berapa staff") ||
            q.includes("jumlah staff") ||
            q.includes("berapa pegawai") ||
            q.includes("jumlah pegawai")
        )
        &&
        !q.includes("zon")
    ){

        addAIMessage(
            `Jumlah ahli PTIS yang berdaftar ialah ` +
            `<b>${staff.length} orang</b>.`
        );

        return;

    }


    /*==================================================
      PENYELARAS
    ==================================================*/

    if(
        q.includes("penyelaras")
    ){

        const coordinators =
        staff.filter(person =>

            (person.role || "")
            .toLowerCase()
            .includes("penyelaras")

        );


        if(coordinators.length === 0){

            addAIMessage(
                "Tiada maklumat penyelaras ditemui."
            );

            return;

        }


        const names =
        coordinators
        .map(person =>
            `<b>${person.name || person.nama || "-"}</b>`
        )
        .join("<br>");


        addAIMessage(
            `Penyelaras PTIS ialah:<br><br>${names}`
        );

        return;

    }


    /*==================================================
      ZONE DETECTION
    ==================================================*/

    const zones = [

        "Padang Serai",
        "Kulim",
        "Sungai Ular",
        "Bandar Baharu",
        "Serdang"

    ];


    const selectedZone =
    zones.find(zone =>

        q.includes(
            zone.toLowerCase()
        )

    );


    if(selectedZone){

        const zoneStaff =
        staff.filter(person => {

            /* Penyelaras utama tidak dimasukkan
               dalam pengiraan zon */

            if(
                (person.role || "")
                .toLowerCase()
                .includes("penyelaras")
            ){
                return false;
            }


            const zone =
            (person.zone || "")
            .toLowerCase();


            return zone.includes(
                selectedZone.toLowerCase()
            );

        });


        /*==============================================
          JUMLAH AHLI ZON
        ==============================================*/

        if(
            q.includes("berapa") ||
            q.includes("jumlah")
        ){

            addAIMessage(
                `Jumlah ahli PTIS bagi Zon ` +
                `<b>${selectedZone}</b> ialah ` +
                `<b>${zoneStaff.length} orang</b>.`
            );

            return;

        }


        /*==============================================
          SENARAI AHLI ZON
        ==============================================*/

        if(
            q.includes("senarai") ||
            q.includes("siapa") ||
            q.includes("ahli") ||
            q.includes("staff") ||
            q.includes("pegawai")
        ){

            if(zoneStaff.length === 0){

                addAIMessage(
                    `Tiada ahli ditemui bagi Zon ` +
                    `<b>${selectedZone}</b>.`
                );

                return;

            }


            const list =
            zoneStaff
            .map((person,index)=>{

                const name =
                person.name ||
                person.nama ||
                "-";

                const school =
                person.school ||
                person.sekolah ||
                "";

                return (
                    `${index + 1}. <b>${name}</b>` +
                    (school
                        ? `<br>&nbsp;&nbsp;&nbsp;${school}`
                        : "")
                );

            })
            .join("<br><br>");


            addAIMessage(
                `Senarai ahli PTIS Zon ` +
                `<b>${selectedZone}</b>:<br><br>` +
                list
            );

            return;

        }

    }

    /*==================================================
  PERGERAKAN SEMASA SEMUA AHLI PTIS
==================================================*/

if(
    q.includes("pergerakan semasa") ||
    q.includes("siapa berada di pejabat") ||
    q.includes("siapa di pejabat") ||
    q.includes("siapa bertugas di pejabat") ||
    q.includes("berapa orang di pejabat") ||
    q.includes("berapa ahli di pejabat")
){

    const officeStaff =
        staff.filter(person =>
            (person.currentStatus || "")
            .toLowerCase()
            .trim() === "office"
        );


    /* =============================================
       SOALAN JUMLAH
    ============================================= */

    if(
        q.includes("berapa") ||
        q.includes("jumlah")
    ){

        addAIMessage(
            `Terdapat <b>${officeStaff.length} orang</b> ` +
            `ahli PTIS yang kini berada di pejabat.`
        );

        return;

    }


    /* =============================================
       SENARAI PERGERAKAN
    ============================================= */

    if(officeStaff.length === 0){

        addAIMessage(
            "Tiada ahli PTIS yang direkodkan berada di pejabat pada masa ini."
        );

        return;

    }


    const list =
        officeStaff
        .map((person,index)=>{

            const name =
                person.nama ||
                person.name ||
                "-";

            const zone =
                person.zone ||
                "-";

            return (
                `${index + 1}. <b>${name}</b>` +
                `<br>&nbsp;&nbsp;&nbsp;📍 ${zone}`
            );

        })
        .join("<br><br>");


    addAIMessage(
        `Pergerakan semasa PTIS — ` +
        `<b>berada di pejabat</b>:<br><br>` +
        list
    );

    return;

}

    /*==================================================
  CARIAN PEGAWAI BERDASARKAN NAMA
==================================================*/

const staffMatches =
findStaffByName(
    question,
    staff
);


if(staffMatches.length === 1){

    const person =
        staffMatches[0];


    const name =
        person.name ||
        person.nama ||
        "-";


    const zone =
        person.zone ||
        "-";


    const school =
        person.school ||
        person.sekolah ||
        "-";


    const role =
        person.role ||
        person.jawatan ||
        "-";


    /*==============================================
      SOALAN ZON
    ==============================================*/

    if(
        q.includes("zon") ||
        q.includes("dari mana")
    ){

        addAIMessage(
            `<b>${name}</b> adalah daripada ` +
            `Zon <b>${zone}</b>.`
        );

        return;

    }

    /*==============================================
  PERGERAKAN / LOKASI SEMASA PEGAWAI
==============================================*/

if(
    q.includes("bertugas") ||
    q.includes("berada") ||
    q.includes("lokasi") ||
    q.includes("pergerakan") ||
    q.includes("sekarang") ||
    q.includes("hari ini")
){

    const currentStatus =
        (person.currentStatus || "")
        .toLowerCase()
        .trim();


    if(!currentStatus){

        addAIMessage(
            `Maklumat pergerakan semasa bagi ` +
            `<b>${name}</b> belum tersedia.`
        );

        return;

    }


    let statusText =
        person.currentStatus;


    /* TERJEMAH STATUS SISTEM */

    if(currentStatus === "office"){

        statusText =
            "berada di pejabat";

    }

    else if(currentStatus === "school"){

        statusText =
            "berada di sekolah";

    }

    else if(currentStatus === "outstation"){

        statusText =
            "bertugas di luar";

    }

    else if(currentStatus === "leave"){

        statusText =
            "sedang bercuti";

    }


    addAIMessage(
        `Pergerakan semasa <b>${name}</b>:<br><br>` +
        `📍 <b>${statusText}</b>`
    );

    return;

}


    /*==============================================
  SOALAN SEKOLAH / SEKOLAH SELIAAN
==============================================*/

if(
    q.includes("sekolah seliaan") ||
    q.includes("seliaan") ||
    q.includes("selian") ||
    q.includes("selia") ||
    q.includes("jaga sekolah") ||
    q.includes("menjaga sekolah")
){

    const schools =
        Array.isArray(person.sekolahSeliaan)
            ? person.sekolahSeliaan
            : [];


    if(schools.length === 0){

        addAIMessage(
            `Maklumat sekolah seliaan bagi ` +
            `<b>${name}</b> tidak tersedia ` +
            `dalam pangkalan data PTIS.`
        );

        return;

    }


    const schoolList =
        schools
        .map(
            (school,index) =>
                `${index + 1}. <b>${school}</b>`
        )
        .join("<br>");


    addAIMessage(
        `<b>${name}</b> mempunyai ` +
        `<b>${schools.length} sekolah seliaan</b>:<br><br>` +
        schoolList
    );

    return;

}


    /*==============================================
  MAKLUMAT UMUM PEGAWAI
==============================================*/

const email =
    person.email ||
    "";

const status =
    person.status ||
    "";

const currentStatus =
    person.currentStatus ||
    "";

const schools =
    Array.isArray(person.sekolahSeliaan)
        ? person.sekolahSeliaan
        : [];


let info =

    `Maklumat pegawai yang ditemui:<br><br>` +

    `👤 <b>${name}</b><br>` +

    `📍 ${zone}<br>` +

    `💼 ${role}`;


/* EMAIL */

if(email){

    info +=
        `<br>📧 ${email}`;

}


/* STATUS */

if(status){

    info +=
        `<br>🟢 Status: <b>${status}</b>`;

}


/* SEKOLAH SELIAAN */

if(schools.length > 0){

    info +=
        `<br>🏫 Sekolah Seliaan: ` +
        `<b>${schools.length}</b>`;

}


addAIMessage(info);

return;

}


/*==================================================
  LEBIH DARIPADA SATU NAMA DITEMUI
==================================================*/

if(staffMatches.length > 1){

    const list =
    staffMatches
    .slice(0,10)
    .map((person,index)=>{

        const name =
            person.name ||
            person.nama ||
            "-";

        const school =
            person.school ||
            person.sekolah ||
            "";

        return (
            `${index + 1}. <b>${name}</b>` +
            (school
                ? `<br>&nbsp;&nbsp;&nbsp;${school}`
                : "")
        );

    })
    .join("<br><br>");


    addAIMessage(
        `Saya menemui ${staffMatches.length} pegawai ` +
        `yang sepadan:<br><br>${list}`
    );

    return;

}


    /*==================================================
      FALLBACK
    ==================================================*/

    addAIMessage(
        "Maaf, saya masih belajar memahami soalan tersebut. " +
        "Cuba tanya tentang jumlah ahli, penyelaras atau ahli mengikut zon."
    );

}