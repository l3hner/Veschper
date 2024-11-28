// DOM-Elemente referenzieren
const form = document.getElementById('order-form');
const tableBody = document.querySelector('#order-table tbody');
const totalCount = document.getElementById('total-count');
const confirmation = document.getElementById('confirmation');
const resetButton = document.getElementById('reset-button');
const dailyOverview = document.getElementById('daily-overview');
const yesNoSelect = document.getElementById('yes-no');
const quantitySelect = document.getElementById('quantity');

// Firestore-Datenbank
const db = firebase.firestore();

// Daten laden und anzeigen, wenn die Seite geladen wird
window.addEventListener('load', () => {
    // Lade den gespeicherten Zustand aus Firebase
    db.collection("websiteState").doc("currentState").get().then((doc) => {
        if (doc.exists) {
            const data = doc.data();
            totalCount.textContent = data.totalCount || 0;

            // Tabelle wiederherstellen
            data.orders.forEach(order => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${order.name}</td><td>${order.yesNo}</td><td>${order.quantity === 0 ? '-' : order.quantity}</td>`;
                tableBody.appendChild(row);
            });

            // Dashboard wiederherstellen
            dailyOverview.innerHTML = data.dailyOverviewHtml || '';
        }
    }).catch((error) => {
        console.error("Fehler beim Laden des Zustands: ", error);
    });
});

// Formular-Submit-Ereignis, um den Zustand zu aktualisieren und zu speichern
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

    // Gesamtanzahl aktualisieren
    let currentTotal = parseInt(totalCount.textContent);
    if (yesNo === 'Ja') {
        currentTotal += quantity;
    }
    totalCount.textContent = currentTotal;

    // Bestätigungsanzeige
    confirmation.style.display = 'block';
    setTimeout(() => (confirmation.style.display = 'none'), 3000);

    // Den aktuellen Zustand in Firestore speichern
    const orders = [];
    document.querySelectorAll('#order-table tbody tr').forEach((row) => {
        const cells = row.querySelectorAll('td');
        orders.push({
            name: cells[0].textContent,
            yesNo: cells[1].textContent,
            quantity: cells[2].textContent === '-' ? 0 : parseInt(cells[2].textContent)
        });
    });

    const dailyOverviewHtml = dailyOverview.innerHTML;

    // Speichere den aktuellen Zustand in Firebase
    db.collection("websiteState").doc("currentState").set({
        totalCount: currentTotal,
        orders: orders,
        dailyOverviewHtml: dailyOverviewHtml
    }).then(() => {
        console.log("Der aktuelle Zustand wurde erfolgreich gespeichert.");
    }).catch((error) => {
        console.error("Fehler beim Speichern des Zustands: ", error);
    });

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
            // Firebase-Bestellungen löschen und Zustand zurücksetzen
            db.collection("websiteState").doc("currentState").set({
                totalCount: 0,
                orders: [],
                dailyOverviewHtml: ''
            }).then(() => {
                // Tabelle und Summen zurücksetzen
                tableBody.innerHTML = '';
                totalCount.textContent = 0;
                dailyOverview.innerHTML = '';
                console.log("Daten erfolgreich zurückgesetzt und Zustand gespeichert.");
            });
        }).catch((error) => {
            console.error("Fehler beim Zurücksetzen der Daten: ", error);
        });
    } else {
        alert('Falsches Passwort. Zurücksetzen nicht möglich.');
    }
});
