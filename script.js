// DOM-Elemente referenzieren
const form = document.getElementById('order-form');
const tableBody = document.querySelector('#order-table tbody');
const totalCount = document.getElementById('total-count');
const confirmation = document.getElementById('confirmation');
const resetButton = document.getElementById('reset-button');
const dailyOverview = document.getElementById('daily-overview');

// Variablen für Bestellungen und Gesamtanzahl
let total = 0;
const orders = [];

// Formular-Submit-Ereignis
form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Eingaben validieren
    const yesNo = document.getElementById('yes-no').value;
    const name = document.getElementById('name').value.trim();
    const quantity = parseInt(document.getElementById('quantity').value);

    if (!yesNo || !name || isNaN(quantity)) {
        alert('Bitte fülle alle Felder korrekt aus!');
        return;
    }

    // Bestellung in die Tabelle einfügen
    const row = document.createElement('tr');
    row.innerHTML = `<td>${name}</td><td>${yesNo}</td><td>${quantity}</td>`;
    tableBody.appendChild(row);

    // Gesamtanzahl aktualisieren
    total += quantity;
    totalCount.textContent = total;

    // Bestellung speichern
    orders.push({ name, yesNo, quantity });

    // Bestätigungsanzeige
    confirmation.style.display = 'block';
    setTimeout(() => (confirmation.style.display = 'none'), 3000);

    // Formular zurücksetzen
    form.reset();
});

// Rücksetzen-Button
resetButton.addEventListener('click', () => {
    // Tagesübersicht speichern
    const date = new Date().toLocaleDateString();
    dailyOverview.innerHTML += `<p>${date}: ${total} Leberkäswecken</p>`;

    // Tabelle und Summen zurücksetzen
    tableBody.innerHTML = '';
    total = 0;
    totalCount.textContent = total;
});
