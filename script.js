import { collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// DOM-Elemente referenzieren
const form = document.getElementById('order-form');
const tableBody = document.querySelector('#order-table tbody');
const totalCount = document.getElementById('total-count');
const confirmation = document.getElementById('confirmation');
const resetButton = document.getElementById('reset-button');
const dailyOverview = document.getElementById('daily-overview');
const yesNoSelect = document.getElementById('yes-no');
const quantitySelect = document.getElementById('quantity');

// Initialisiere Firestore (benutze die bereits initialisierte db aus Firebase Config)
const db = getFirestore();

// Daten laden
window.addEventListener('load', async () => {
    const ordersSnapshot = await getDocs(collection(db, "orders"));
    let total = 0;

    ordersSnapshot.forEach((doc) => {
        const order = doc.data();
        const row = document.createElement('tr');
        row.innerHTML = `<td>${order.name}</td><td>${order.yesNo}</td><td>${order.quantity === 0 ? '-' : order.quantity}</td>`;
        tableBody.appendChild(row);
        if (order.yesNo === 'Ja') {
            total += order.quantity;
        }
    });

    totalCount.textContent = total;

    const overviewSnapshot = await getDocs(collection(db, "dailyOverview"));
    overviewSnapshot.forEach((doc) => {
        dailyOverview.innerHTML += `<p>${doc.data().date}: ${doc.data().total} Leberkäswecken</p>`;
    });
});

// Formular-Submit-Ereignis
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Eingaben validieren
    const yesNo = yesNoSelect.value;
    const name = document.getElementById('name').value.trim();
    const quantity = parseInt(quantitySelect.value);

    if (!yesNo || !name || (yesNo === 'Ja' && isNaN(quantity))) {
        alert('Bitte fülle alle Felder korrekt aus!');
        return;
    }

    // Bestellung in die Tabelle einfügen
    const row = document.createElement('tr');
    row.innerHTML = `<td>${name}</td><td>${yesNo}</td><td>${yesNo === 'Ja' ? quantity : '-'}</td>`;
    tableBody.appendChild(row);

    // Firebase-Daten speichern
    await addDoc(collection(db, "orders"), {
        name: name,
        yesNo: yesNo,
        quantity: yesNo === 'Ja' ? quantity : 0
    });

    // Gesamtanzahl aktualisieren
    let currentTotal = parseInt(totalCount.textContent);
    if (yesNo === 'Ja') {
        currentTotal += quantity;
    }
    totalCount.textContent = currentTotal;

    // Bestätigungsanzeige
    confirmation.style.display = 'block';
    setTimeout(() => (confirmation.style.display = 'none'), 3000);

    // Formular zurücksetzen
    form.reset();
    quantitySelect.disabled = false;
});

// Abhängigkeit von Ja/Nein für die Anzahl-Auswahl
yesNoSelect.addEventListener('change', () => {
    if (yesNoSelect.value === 'Nein') {
        quantitySelect.value = '';
        quantitySelect.disabled = true;
    } else {
        quantitySelect.disabled = false;
    }
});

// Rücksetzen-Button mit Passwortabfrage
resetButton.addEventListener('click', async () => {
    const password = prompt('Bitte gib das Passwort ein, um die Daten zurückzusetzen:');
    if (password === 'meister') {
        const date = new Date().toLocaleDateString();
        const total = parseInt(totalCount.textContent);

        await addDoc(collection(db, "dailyOverview"), {
            date: date,
            total: total
        });

        // Firebase-Bestellungen löschen
        const ordersSnapshot = await getDocs(collection(db, "orders"));
        ordersSnapshot.forEach(async (docItem) => {
            await deleteDoc(doc(db, "orders", docItem.id));
        });

        // Tabelle und Summen zurücksetzen
        tableBody.innerHTML = '';
        totalCount.textContent = 0;
    } else {
        alert('Falsches Passwort. Zurücksetzen nicht möglich.');
    }
});
