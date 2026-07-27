import {
    db
} from "./firebase.js";

import {
    collection,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

let activityChart;
let statusChart;

const total =
document.getElementById("analyticsTotal");

const office =
document.getElementById("analyticsOffice");

const outside =
document.getElementById("analyticsOutside");

const today =
document.getElementById("analyticsToday");

const activityContainer =
document.getElementById("analyticsActivity");

const todayString =
new Date().toISOString().split("T")[0];

onSnapshot(
collection(db,"movements"),
(snapshot)=>{

    let totalRecord=0;

    let officeTotal=0;
    let outsideTotal=0;
    let todayTotal=0;

    let meeting=0;
    let course=0;
    let leave=0;
    let hrmis=0;

    const latest=[];

    snapshot.forEach(doc=>{

        const data=
        doc.data();

        totalRecord++;

        if(data.date===todayString){

            todayTotal++;

        }

        switch(data.type){

            case "office":
                officeTotal++;
            break;

            case "outsideSchool":
                outsideTotal++;
            break;

            case "meeting":
                meeting++;
                outsideTotal++;
            break;

            case "course":
                course++;
                outsideTotal++;
            break;

            case "leave":
                leave++;
                outsideTotal++;
            break;

            case "hrmis":
                hrmis++;
                outsideTotal++;
            break;

        }

        latest.push(data);

    });

    total.textContent=
    totalRecord;

    office.textContent=
    officeTotal;

    outside.textContent=
    outsideTotal;

    today.textContent=
    todayTotal;

    latest.sort((a,b)=>{

        return (
        b.createdAt?.seconds||0
        )-
        (
        a.createdAt?.seconds||0
        );

    });

    activityContainer.innerHTML = "";

latest
.sort((a,b)=>{

    return (
        b.createdAt?.seconds || 0
    ) -
    (
        a.createdAt?.seconds || 0
    );

})
.slice(0,10)
.forEach(item=>{

    activityContainer.innerHTML += `

    <tr class="hover:bg-slate-50 transition">

        <td class="px-6 py-4">

            <div class="font-semibold text-slate-800">

                ${item.name || "-"}

            </div>

        </td>

        <td class="px-6 py-4">

            ${item.activity || "-"}

        </td>

        <td class="px-6 py-4">

            ${item.location || "-"}

        </td>

        <td class="px-6 py-4 text-slate-500">

            ${item.date || "-"}

        </td>

        <td class="px-6 py-4 text-slate-500">

            ${item.time || "-"}

        </td>

    </tr>

    `;

});

if(activityContainer.innerHTML===""){

    activityContainer.innerHTML = `

    <tr>

        <td
        colspan="5"
        class="text-center py-10 text-slate-400">

            Tiada aktiviti direkodkan.

        </td>

    </tr>

    `;

}

    buildCharts({

        office:officeTotal,
        outside:outsideTotal,
        meeting,
        course,
        leave,
        hrmis

    });

});

function buildCharts(data){

    if(activityChart){

        activityChart.destroy();

    }

    if(statusChart){

        statusChart.destroy();

    }

    /* ================= BAR CHART ================= */

    activityChart =
    new Chart(

        document.getElementById("activityChart"),

        {

            type:"bar",

            data:{

                labels:[

                    "Meeting",
                    "Course",
                    "Leave",
                    "HRMIS"

                ],

                datasets:[{

                    label:"Jumlah Aktiviti",

                    data:[

                        data.meeting,
                        data.course,
                        data.leave,
                        data.hrmis

                    ],

                    backgroundColor:[

                        "#3B82F6",
                        "#10B981",
                        "#F59E0B",
                        "#EF4444"

                    ],

                    borderRadius:12,

                    borderSkipped:false,

                    maxBarThickness:60

                }]

            },

            options:{

                responsive:true,

                maintainAspectRatio:false,

                animation:{

                    duration:800

                },

                plugins:{

                    legend:{
                        display:false
                    },

                    tooltip:{

                        backgroundColor:"#1E293B",

                        titleColor:"#FFFFFF",

                        bodyColor:"#FFFFFF"

                    }

                },

                scales:{

                    x:{

                        grid:{
                            display:false
                        },

                        ticks:{

                            color:"#475569",

                            font:{

                                size:13,

                                weight:"600"

                            }

                        }

                    },

                    y:{

                        beginAtZero:true,

                        ticks:{

                            stepSize:1,

                            precision:0,

                            color:"#64748B"

                        },

                        grid:{

                            color:"#E2E8F0"

                        }

                    }

                }

            }

        }

    );

    /* ================= DOUGHNUT ================= */

    statusChart =
    new Chart(

        document.getElementById("statusChart"),

        {

            type:"doughnut",

            data:{

                labels:[

                    "Dalam Pejabat",
                    "Luar Pejabat"

                ],

                datasets:[{

                    data:[

                        data.office,
                        data.outside

                    ],

                    backgroundColor:[

                        "#3B82F6",
                        "#F43F5E"

                    ],

                    borderWidth:2,

                    borderColor:"#FFFFFF",

                    hoverOffset:10

                }]

            },

            options:{

                responsive:true,

                maintainAspectRatio:false,

                cutout:"68%",

                layout:{

                    padding:15

                },

                plugins:{

                    legend:{

                        position:"left",

                        align:"center",

                        labels:{

                            boxWidth:18,

                            boxHeight:18,

                            padding:18,

                            font:{

                                size:14,

                                weight:"600"

                            }

                        }

                    },

                    tooltip:{

                        backgroundColor:"#1E293B",

                        titleColor:"#FFFFFF",

                        bodyColor:"#FFFFFF",

                        callbacks:{

                            label:function(context){

                                const total =
                                context.dataset.data.reduce(

                                    (a,b)=>a+b,

                                    0

                                );

                                const value =
                                context.raw;

                                const percent =
                                (
                                    value /
                                    total *
                                    100
                                ).toFixed(1);

                                return `${context.label} : ${value} (${percent}%)`;

                            }

                        }

                    }

                }

            }

        }

    );

}