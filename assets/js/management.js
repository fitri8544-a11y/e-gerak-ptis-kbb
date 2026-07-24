/* ======================================================
   MANAGEMENT MODULE
   E-GERAK PTIS KBB V2
====================================================== */

document.addEventListener("DOMContentLoaded",()=>{

    const pageTitle =
    document.querySelector(".header-title h1");

    const sections =
    document.querySelectorAll(".content-section");

    const menuButtons =
    document.querySelectorAll(".menu button");

    /* ================= SHOW PAGE ================= */

    window.showSection = function(
        sectionId,
        title,
        button
    ){

        sections.forEach(section=>{

            section.classList.add("hidden");

        });

        const target =
        document.getElementById(sectionId);

        if(target){

            target.classList.remove("hidden");

        }

        if(pageTitle){

            pageTitle.textContent =
            title;

        }

        menuButtons.forEach(btn=>{

            btn.classList.remove("active");

        });

        if(button){

            button.classList.add("active");

        }

    };

    /* ================= MANAGEMENT ================= */

    const managementBtn =
    document.getElementById(
        "managementBtn"
    );

    const managementMenu =
    document.getElementById(
        "managementMenu"
    );

    const managementArrow =
    document.getElementById(
        "managementArrow"
    );

    if(managementBtn){

        managementBtn.addEventListener("click",()=>{

            managementMenu.classList.toggle("hidden");

            managementArrow.classList.toggle("rotate-180");

        });

    }

});