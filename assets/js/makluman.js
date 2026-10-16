import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const announcementsRef = collection(db, "announcements");

/* ================= HALAMAN UTAMA ================= */

const publicList = document.getElementById(
  "generalAnnouncements"
);

if (publicList) {
  const activeQuery = query(
    announcementsRef,
    where("active", "==", true)
  );

  onSnapshot(activeQuery, snapshot => {
    const items = snapshot.docs.map(item => ({
      ...item.data(),
      id: item.id
    }));

    items.sort((a, b) => {
      const difference =
        (b.createdAt?.toMillis?.() || 0) -
        (a.createdAt?.toMillis?.() || 0);

      return difference || a.id.localeCompare(b.id);
    });

    publicList.replaceChildren();

    const count = document.getElementById(
      "announcementCount"
    );

    if (count) count.textContent = items.length;

    if (!items.length) {
      const empty = document.createElement("p");
      empty.className = "text-sm text-slate-500";
      empty.textContent = "Tiada makluman umum terkini.";
      publicList.append(empty);
      return;
    }

    items.forEach(item => {
      const card = document.createElement("article");
      card.className =
        "rounded-2xl border border-sky-200 bg-sky-50 p-5";

      const title = document.createElement("h3");
      title.className =
        "font-bold text-lg text-slate-900 break-words";
      title.textContent = String(item.title || "");

      const body = document.createElement("p");
      body.className =
        "mt-2 text-sm leading-relaxed text-slate-600 " +
        "whitespace-pre-wrap break-words";
      body.textContent = String(item.body || "");

      card.append(title, body);

      const date = item.createdAt?.toDate?.();

      if (date) {
        const time = document.createElement("p");
        time.className = "mt-3 text-xs text-slate-500";
        time.textContent = date.toLocaleString("ms-MY", {
          timeZone: "Asia/Kuala_Lumpur",
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });
        card.append(time);
      }

      publicList.append(card);
    });
  }, error => {
    console.error("Makluman gagal dimuatkan:", error);

    const message = document.createElement("p");
    message.className = "text-sm text-red-600";
    message.textContent =
      "Makluman belum dapat dimuatkan. Sila cuba semula.";

    publicList.replaceChildren(message);

    const count = document.getElementById(
      "announcementCount"
    );
    if (count) count.textContent = "—";
  });
}

/* ================= DASHBOARD ADMIN ================= */

const form = document.getElementById("announcementForm");
const addButton = document.getElementById(
  "addAnnouncementBtn"
);
const saveButton = document.getElementById(
  "saveAnnouncementBtn"
);
const cancelButton = document.getElementById(
  "cancelAnnouncementBtn"
);
const status = document.getElementById(
  "announcementAdminStatus"
);

if (form && addButton && saveButton && cancelButton && status) {
  const titleInput = document.getElementById(
    "announcementTitle"
  );
  const bodyInput = document.getElementById(
    "announcementBody"
  );
  const activeInput = document.getElementById(
    "announcementActive"
  );

  let adminUid = null;
  let saving = false;

  onAuthStateChanged(auth, async user => {
    adminUid = null;
    addButton.disabled = true;
    form.hidden = true;

    if (!user) {
      status.textContent = "Sila login sebagai admin.";
      return;
    }

    try {
      const profile = await getDoc(
        doc(db, "users", user.uid)
      );

      // Abaikan hasil lama jika sesi telah bertukar.
      if (auth.currentUser?.uid !== user.uid) return;

      if (
        String(profile.data()?.role || "")
          .trim().toLowerCase() !== "admin"
      ) {
        status.textContent =
          "Fungsi ini untuk akaun admin sahaja.";
        return;
      }

      adminUid = user.uid;
      addButton.disabled = false;
      status.textContent = "Sedia untuk tambah makluman.";
    } catch (error) {
      console.error(error);
      status.textContent = "Akses admin gagal disemak.";
    }
  });

  addButton.addEventListener("click", () => {
    if (!adminUid || saving) return;
    form.reset();
    form.hidden = false;
    status.textContent = "";
    titleInput.focus();
  });

  cancelButton.addEventListener("click", () => {
    if (saving) return;
    form.hidden = true;
    form.reset();
    status.textContent = "";
    addButton.focus();
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();

    if (saving) return;

    if (!adminUid || auth.currentUser?.uid !== adminUid) {
      status.textContent = "Sila login semula sebagai admin.";
      return;
    }

    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();
    const active = activeInput.checked;

    if (!title || !body) {
      status.textContent = "Sila lengkapkan tajuk dan kandungan.";
      return;
    }

    saving = true;
    addButton.disabled = true;
    saveButton.disabled = true;
    cancelButton.disabled = true;
    status.textContent = "Menyimpan makluman...";

    try {
      await addDoc(announcementsRef, {
        title,
        body,
        active,
        createdBy: adminUid,
        createdAt: serverTimestamp()
      });

      form.reset();
      form.hidden = true;

      status.textContent = active
        ? "✅ Disimpan. Makluman akan muncul pada halaman utama."
        : "✅ Disimpan sebagai makluman tidak aktif.";
    } catch (error) {
      console.error("Simpan makluman gagal:", error);
      status.textContent =
        "Gagal menyimpan. Semak sambungan dan kebenaran Firestore.";
    } finally {
      saving = false;
      addButton.disabled = !adminUid;
      saveButton.disabled = false;
      cancelButton.disabled = false;
    }
  });
}

/* ================= SENARAI DAN PADAM MAKLUMAN ================= */

const adminAnnouncementList = document.getElementById(
  "adminAnnouncementList"
);

if (adminAnnouncementList) {
  let stopAnnouncementList = null;
  let announcementSession = 0;

  onAuthStateChanged(auth, async user => {
    const session = ++announcementSession;

    if (stopAnnouncementList) {
      stopAnnouncementList();
      stopAnnouncementList = null;
    }

    adminAnnouncementList.textContent =
      "Menyemak akses admin...";

    if (!user) {
      adminAnnouncementList.textContent =
        "Sila login sebagai admin.";
      return;
    }

    try {
      const profile = await getDoc(
        doc(db, "users", user.uid)
      );

      if (session !== announcementSession) return;

      const role = String(profile.data()?.role || "")
        .trim()
        .toLowerCase();

      if (role !== "admin") {
        adminAnnouncementList.textContent =
          "Senarai ini untuk admin sahaja.";
        return;
      }

      stopAnnouncementList = onSnapshot(
        announcementsRef,
        snapshot => {
          if (session !== announcementSession) return;

          const items = snapshot.docs.map(item => ({
            ...item.data(),
            id: item.id
          }));

          items.sort((a, b) =>
            (b.createdAt?.toMillis?.() || 0) -
            (a.createdAt?.toMillis?.() || 0)
          );

          adminAnnouncementList.replaceChildren();

          if (!items.length) {
            adminAnnouncementList.textContent =
              "Tiada makluman disimpan.";
            return;
          }

          items.forEach(item => {
            const card = document.createElement("article");
            card.className =
              "rounded-xl border border-slate-200 p-4";

            const title = document.createElement("h4");
            title.className =
              "font-bold text-slate-900 break-words";
            title.textContent = String(item.title || "");

            const body = document.createElement("p");
            body.className =
              "mt-2 text-sm text-slate-600 " +
              "whitespace-pre-wrap break-words";
            body.textContent = String(item.body || "");

            const state = document.createElement("p");
            state.className = "mt-2 text-xs text-slate-500";
            state.textContent = item.active
              ? "🟢 Aktif"
              : "⚪ Tidak aktif";

            const button = document.createElement("button");
            button.type = "button";
            button.className =
              "mt-3 rounded-lg bg-red-600 px-4 py-2 " +
              "text-sm font-semibold text-white " +
              "hover:bg-red-700 disabled:opacity-50";
            button.textContent = "🗑 Padam";

            const feedback = document.createElement("p");
            feedback.className = "mt-2 text-sm text-red-600";
            feedback.setAttribute("role", "status");

            button.addEventListener("click", async () => {
              if (button.disabled) return;

              if (
                session !== announcementSession ||
                auth.currentUser?.uid !== user.uid
              ) {
                feedback.textContent =
                  "Sesi berubah. Sila login semula.";
                return;
              }

              const confirmed = window.confirm(
                `Padam makluman "${item.title}"?\n\n` +
                "Makluman ini akan dipadam daripada Firestore " +
                "dan halaman utama. Tindakan ini tidak boleh dibatalkan."
              );

              if (!confirmed) return;

              button.disabled = true;
              button.textContent = "Memadam...";
              feedback.textContent = "";

              try {
                await deleteDoc(
                  doc(db, "announcements", item.id)
                );

                // Senarai dikemas kini oleh onSnapshot.
                console.log("✅ Makluman berjaya dipadam.");
              } catch (error) {
                console.error("Padam makluman gagal:", error);

                feedback.textContent =
                  "Gagal memadam. Semak sambungan dan kebenaran admin.";

                button.disabled = false;
                button.textContent = "🗑 Padam";
              }
            });

            card.append(title, body, state, button, feedback);
            adminAnnouncementList.append(card);
          });
        },
        error => {
          if (session !== announcementSession) return;

          console.error("Senarai makluman gagal:", error);
          adminAnnouncementList.textContent =
            "Senarai gagal dimuatkan. Semak UID admin dalam Rules.";
        }
      );
    } catch (error) {
      if (session !== announcementSession) return;

      console.error(error);
      adminAnnouncementList.textContent =
        "Akses admin gagal disemak.";
    }
  });
}