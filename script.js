// DOM-Elemente referenzieren
const form = document.getElementById('order-form');
const tableBody = document.querySelector('#order-table tbody');
const totalCount = document.getElementById('total-count');
const confirmation = document.getElementById('confirmation');
const resetButton = document.getElementById('reset-button');
const dailyOverview = document.getElementById('daily-overview');
const yesNoSelect = document.getElementById('yes-no');
const quantitySelect = document.getElementById('quantity');

// Firestore-Datenbank (db ist bereits initialisiert)
const db = firebase.firestore();

// Daten laden
window.addEventListener('load', () => {
    db.collection("orders").get().then((querySnapshot) => {
        let total = 0;
        querySnapshot.forEach((doc) => {
            const order = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `<td>${order.name}</td><td>${order.yesNo}</td><td>${order.quantity === 0 ? '-' : order.quantity}</td>`;
            tableBody.appendChild(row);
            if (order.yesNo === 'Ja') {
                total += order.quantity;
            }
        });
        totalCount.textContent = total;
    });

    db.collection("dailyOverview").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            dailyOverview.innerHTML += `<p>${doc.data().date}: ${doc.data().total} Leberkäswecken</p>`;
        });
    });
});

// Formular-Submit-Ereignis
form.addEventListener('submit', (e) => {
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
    db.collection("orders").add({
        name: name,
        yesNo: yesNo,
        quantity: yesNo === 'Ja' ? quantity : 0
    }).then(() => {
        confirmation.style.display = 'block';
        setTimeout(() => (confirmation.style.display = 'none'), 3000);
    });

    // Gesamtanzahl aktualisieren
    let currentTotal = parseInt(totalCount.textContent);
    if (yesNo === 'Ja') {
        currentTotal += quantity;
    }
    totalCount.textContent = currentTotal;

    // Formular zurücksetzen
    form.reset();
    quantitySelect.disabled = false;
});

// Rücksetzen-Button mit Passwortabfrage
resetButton.addEventListener('click', () => {
    const password = prompt('Bitte gib das Passwort ein, um die Daten zurückzusetzen:');
    if (password === 'meister') {
        const date = new Date().toLocaleDateString();
        const total = parseInt(totalCount.textContent);

        db.collection("dailyOverview").add({
            date: date,
            total: total
        }).then(() => {
            // Firebase-Bestellungen löschen
            db.collection("orders").get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    doc.ref.delete();
                });
            });

            // Tabelle und Summen zurücksetzen
            tableBody.innerHTML = '';
            totalCount.textContent = 0;
        });
    } else {
        alert('Falsches Passwort. Zurücksetzen nicht möglich.');
    }
});
