// DOM-Elemente referenzieren
const form = document.getElementById('order-form');
const tableBody = document.querySelector('#order-table tbody');
const totalCount = document.getElementById('total-count');
const confirmation = document.getElementById('confirmation');
const resetButton = document.getElementById('reset-button');
const dailyOverview = document.getElementById('daily-overview');
const yesNoSelect = document.getElementById('yes-no');
const quantitySelect = document.getElementById('quantity');

// Variablen für Bestellungen und Gesamtanzahl
let total = 0;
const orders = [];

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

    // Gesamtanzahl aktualisieren, nur wenn "Ja" ausgewählt wurde
    if (yesNo === 'Ja') {
        total += quantity;
    }
    totalCount.textContent = total;

    // Bestellung speichern
    orders.push({ name, yesNo, quantity: yesNo === 'Ja' ? quantity : 0 });

    // Bestätigungsanzeige
    confirmation.style.display = 'block';
    setTimeout(() => (confirmation.style.display = 'none'), 3000);

    // Formular zurücksetzen
    form.reset();
    quantitySelect.disabled = false; // Zurücksetzen des Zustands der Menge-Auswahl
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
resetButton.addEventListener('click', () => {
    const password = prompt('Bitte gib das Passwort ein, um die Daten zurückzusetzen:');
    if (password === 'geheimesPasswort') { // Hier kannst du das Passwort nach Belieben ändern
        // Tagesübersicht speichern
        const date = new Date().toLocaleDateString();
        dailyOverview.innerHTML += `<p>${date}: ${total} Leberkäswecken</p>`;

        // Tabelle und Summen zurücksetzen
        tableBody.innerHTML = '';
        total = 0;
        totalCount.textContent = total;
    } else {
        alert('Falsches Passwort. Zurücksetzen nicht möglich.');
    }
});
