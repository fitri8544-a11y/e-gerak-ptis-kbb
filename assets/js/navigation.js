/* ======================================================
   E-GERAK PTIS KBB V2
   NAVIGATION.JS
====================================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ================= MENU ================= */

    const menuButtons =
    document.querySelectorAll(".menu button");

    /* ================= SECTION ================= */

    const dashboardSection =
    document.getElementById("dashboardSection");

    const staffManagementSection =
    document.getElementById("staffManagementSection");

    const reportsSection =
    document.getElementById("reportsSection");

    const settingsSection =
    document.getElementById("settingsSection");

    const analyticsSection =
    document.getElementById("analyticsSection");

    const pageTitle =
    document.querySelector(".header-title h1");

    const pageSubtitle =
    document.querySelector(".header-title p");

    const sections = [

        dashboardSection,
        staffManagementSection,
        reportsSection,
        analyticsSection,
        settingsSection

    ];

    /* ================= HIDE ALL ================= */

    function hideAllSections(){

        sections.forEach(section=>{

            if(section){

                section.classList.add("hidden");

            }

        });

    }

    /* ================= ACTIVE MENU ================= */

    function setActive(button){

        menuButtons.forEach(btn=>{

            btn.classList.remove("active");

        });

        button.classList.add("active");

    }

    /* ================= OPEN SECTION ================= */

    function openSection(section,button){

        /* Tutup semua modal */

        document
        .getElementById("movementModal")
        ?.classList.add("hidden");

        document
        .getElementById("movementModal")
        ?.classList.remove("flex");

        /* Sembunyikan semua section */

        hideAllSections();

        /* Paparkan section dipilih */

        section?.classList.remove("hidden");

        /* Active menu */

        setActive(button);

        /* ================= HEADER ================= */

if(section===dashboardSection){

    pageTitle.textContent="Dashboard";

    pageSubtitle.textContent=
    "E-GERAK PTIS Kulim Bandar Baharu Version 2";

}

else if(section===staffManagementSection){

    pageTitle.textContent=
    "Staff Management";

    pageSubtitle.textContent=
    "Pengurusan Ahli PTIS";

}

else if(section===reportsSection){

    pageTitle.textContent=
    "Report Center";

    pageSubtitle.textContent=
    "Laporan Pergerakan";

}

else if(section===analyticsSection){

    pageTitle.textContent=
    "Analytics Dashboard";

    pageSubtitle.textContent=
    "Executive Analytics & Performance Monitoring";

}

else if(section===settingsSection){

    pageTitle.textContent=
    "Settings";

    pageSubtitle.textContent=
    "Konfigurasi Sistem";

}

    }

    /* ================= DASHBOARD ================= */

    menuButtons[0]?.addEventListener("click",()=>{

        openSection(
            dashboardSection,
            menuButtons[0]
        );

    });

    /* ================= STAFF ================= */

    menuButtons[1]?.addEventListener("click",()=>{

        openSection(
            staffManagementSection,
            menuButtons[1]
        );

    });

    /* ================= REPORT ================= */

menuButtons[2]?.addEventListener("click",()=>{

    openSection(
        reportsSection,
        menuButtons[2]
    );

});

/* ================= ANALYTICS ================= */

menuButtons[3]?.addEventListener("click",()=>{

    openSection(
        analyticsSection,
        menuButtons[3]
    );

});

/* ================= SETTINGS ================= */

menuButtons[4]?.addEventListener("click",()=>{

    openSection(
        settingsSection,
        menuButtons[3]
    );

});

    /* ================= DEFAULT ================= */

    openSection(
        dashboardSection,
        menuButtons[0]
    );

});