/*======================================================
 E-GERAK PTIS KBB V2
 LIVE LOCATION MODULE
======================================================*/

import {
    db,
    auth
} from "./firebase.js";

import {
    doc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

let watchId = null;

/*======================================================
 START LIVE LOCATION
======================================================*/

export function startLiveLocation(){

    if(!navigator.geolocation){

        console.error("Geolocation tidak disokong.");

        return;

    }

    if(watchId!==null){

        return;

    }

    watchId =
    navigator.geolocation.watchPosition(

        async(position)=>{

            const user =
            auth.currentUser;

            if(!user) return;

            try{

                await updateDoc(

                    doc(db,"users",user.uid),

                    {

                        latitude:
                        position.coords.latitude,

                        longitude:
                        position.coords.longitude,

                        accuracy:
                        position.coords.accuracy,

                        altitude:
                        position.coords.altitude || null,

                        heading:
                        position.coords.heading || 0,

                        speed:
                        position.coords.speed || 0,

                        liveLocation:true,

                        lastLocation:
                        serverTimestamp()

                    }

                );

                console.log("📍 Lokasi berjaya dikemaskini.");

            }catch(error){

                console.error(error);

            }

        },

        (error)=>{

            console.error(
                "GPS Error:",
                error.message
            );

        },

        {

            enableHighAccuracy:false,

            maximumAge:30000,

            timeout:20000

        }

    );

}

/*======================================================
 STOP LIVE LOCATION
======================================================*/

export async function stopLiveLocation(){

    if(watchId!==null){

        navigator.geolocation.clearWatch(
            watchId
        );

        watchId = null;

    }

    const user =
    auth.currentUser;

    if(!user) return;

    try{

        await updateDoc(

            doc(db,"users",user.uid),

            {

                liveLocation:false

            }

        );

    }catch(error){

        console.error(error);

    }

}

/*======================================================
 GET CURRENT LOCATION
======================================================*/

export function getCurrentLocation(){

    return new Promise((resolve, reject)=>{

        if(!navigator.geolocation){

            reject(
                new Error("Browser ini tidak menyokong Geolocation.")
            );

            return;

        }

        navigator.geolocation.getCurrentPosition(

            // Berjaya
            (position)=>{

                console.log("📍 GPS Success:", {

                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy

                });

                resolve(position);

            },

            // Gagal
            (error)=>{

                let message;

                switch(error.code){

                    case error.PERMISSION_DENIED:
                        message = "Kebenaran lokasi ditolak.";
                        break;

                    case error.POSITION_UNAVAILABLE:
                        message = "Lokasi tidak dapat dikesan.";
                        break;

                    case error.TIMEOUT:
                        message = "Masa mendapatkan lokasi telah tamat.";
                        break;

                    default:
                        message = "Ralat mendapatkan lokasi.";

                }

                console.error("❌ GPS Error:", error);

                reject(new Error(message));

            },

            {

                enableHighAccuracy: true,

                timeout: 30000,

                maximumAge: 0

            }

        );

    });

}

/*======================================================
 GET PLACE NAME
======================================================*/

export async function getPlaceName(latitude, longitude){

    try{

        const url =
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;

        console.log("Request URL:", url);

        const response = await fetch(url);

        console.log("HTTP Status:", response.status);

        const text = await response.text();

        console.log("Raw Response:", text);

        const data = JSON.parse(text);

        console.log("Parsed:", data);

        if(data.display_name){

            return data.display_name;

        }

        return `${latitude}, ${longitude}`;

    }

    catch(error){

        console.error("Reverse Geocoding Error:", error);

        return `${latitude}, ${longitude}`;

    }

}