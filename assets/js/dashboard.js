/* ======================================================
   E-GERAK PTIS KBB V2
   DASHBOARD.JS
====================================================== */

/* ================= DOM ================= */

const totalMembers =
document.getElementById("totalMembers");

const officeMembers =
document.getElementById("officeMembers");

const activeMovement =
document.getElementById("activeMovement");

const absentMembers =
document.getElementById("absentMembers");

const totalTasks =
document.getElementById("totalTasks");

const firebaseStatus =
document.getElementById("firebaseStatus");

const systemStatus =
document.getElementById("systemStatus");

const todayMovementTotal =
document.getElementById("todayMovementTotal");


/* ================= DASHBOARD DATA ================= */

const dashboardData = {

    totalMembers:0,

    officeMembers:0,

    activeMovement:0,

    absentMembers:0,

    totalTasks:0,

    todayMovementTotal:0,

    firebaseStatus:"ONLINE",

    systemStatus:"ONLINE"

};


/* ================= UPDATE UI ================= */

function updateDashboard(){

    if(totalMembers)
    totalMembers.textContent =
    dashboardData.totalMembers;

    if(officeMembers)
    officeMembers.textContent =
    dashboardData.officeMembers;

    if(activeMovement)
    activeMovement.textContent =
    dashboardData.activeMovement;

    if(absentMembers)
    absentMembers.textContent =
    dashboardData.absentMembers;

    if(totalTasks)
    totalTasks.textContent =
    dashboardData.totalTasks;

    if(todayMovementTotal)
    todayMovementTotal.textContent =
    dashboardData.todayMovementTotal;

    if(firebaseStatus)
    firebaseStatus.textContent =
    dashboardData.firebaseStatus;

    if(systemStatus)
    systemStatus.textContent =
    dashboardData.systemStatus;

}


/* ================= DEMO DATA ================= */

function loadDemoData(){

    dashboardData.totalMembers = 22;

    dashboardData.officeMembers = 18;

    dashboardData.activeMovement = 4;

    dashboardData.absentMembers = 0;

    dashboardData.totalTasks = 11;

    dashboardData.todayMovementTotal = 4;

    dashboardData.firebaseStatus = "ONLINE";

    dashboardData.systemStatus = "ONLINE";

    updateDashboard();

}


/* ================= INIT ================= */

window.addEventListener("load",()=>{

    loadDemoData();

});