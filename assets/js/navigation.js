/* ==========================================
   E-GERAK PTIS KBB V2
   Navigation Manager
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const menuDashboard = document.getElementById("menuDashboard");
    const menuMovement = document.getElementById("menuMovement");
    const menuHistory = document.getElementById("menuHistory");
    const menuCalendar = document.getElementById("menuCalendar");
    const menuProfile = document.getElementById("menuProfile");
    const menuSetting = document.getElementById("menuSetting");
    const menuLogout = document.getElementById("menuLogout");

    const dashboardSection =
    document.getElementById("dashboardSection");

    const historySection =
    document.getElementById("historySection");

    const calendarSection =
    document.getElementById("calendarSection");

    const profileSection =
    document.getElementById("profileSection");

    const settingSection =
    document.getElementById("settingSection");



    /* ============================= */

    function setActive(menu){

        document
        .querySelectorAll(".menu-item")
        .forEach(item=>{

            item.classList.remove("menu-active");

        });

        menu.classList.add("menu-active");

    }



    /* ============================= */

    function hideAll(){

        dashboardSection.style.display="none";

        historySection.style.display="none";

        calendarSection.style.display="none";

        profileSection.style.display="none";

        settingSection.style.display="none";

    }



    /* ============================= */

    function showDashboard(){

        hideAll();

        dashboardSection.style.display="block";

    }

    function showHistory(){

        hideAll();

        historySection.style.display="block";

    }

    function showCalendar(){

        hideAll();

        calendarSection.style.display="block";

    }

    function showProfile(){

        hideAll();

        profileSection.style.display="block";

    }

    function showSetting(){

        hideAll();

        settingSection.style.display="block";

    }



    /* ============================= */

    showDashboard();



    /* ============================= */

    menuDashboard?.addEventListener("click",()=>{

        setActive(menuDashboard);

        showDashboard();

    });



    menuMovement?.addEventListener("click",()=>{

        setActive(menuMovement);

        document
        .getElementById("fabButton")
        ?.click();

    });



    menuHistory?.addEventListener("click",()=>{

        setActive(menuHistory);

        showHistory();

    });



    menuCalendar?.addEventListener("click",()=>{

        setActive(menuCalendar);

        showCalendar();

    });



    menuProfile?.addEventListener("click",()=>{

        setActive(menuProfile);

        showProfile();

    });



    menuSetting?.addEventListener("click",()=>{

        setActive(menuSetting);

        showSetting();

    });



    menuLogout?.addEventListener("click",()=>{

        if(confirm("Adakah anda pasti ingin log keluar?")){

            window.location.href="index.html";

        }

    });

});