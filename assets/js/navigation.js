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

    const sections = [

        dashboardSection,
        staffManagementSection,
        reportsSection,
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

/* ================= SETTINGS ================= */

menuButtons[3]?.addEventListener("click",()=>{

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