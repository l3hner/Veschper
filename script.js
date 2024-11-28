const form = document.getElementById('order-form');
const tableBody = document.querySelector('#order-table tbody');
const totalCount = document.getElementById('total-count');
const confirmation = document.getElementById('confirmation');
const resetButton = document.getElementById('reset-button');
const dailyOverview = document.getElementById('daily-overview');
const yesNoSelect = document.getElementById('yes-no');
const quantitySelect = document.getElementById('quantity');
const downloadCsvButton = document.getElementById('download-csv');
const chartCanvas = document.getElementById('chartCanvas');

function showFunnyAnimation() {
    confirmation.innerHTML = 'Leberkäs fliegt los! 🥪🚀';
    confirmation.style.display = 'block';
    setTimeout(() => {
        confirmation.style.display = 'none';
        confirmation.innerHTML = 'Danke für deine Bestellung!';
    }, 3000);
}

yesNoSelect.addEventListener('change', () => {
    if (yesNoSelect.value === 'Nein') {
        quantitySelect.value = '';
        quantitySelect.disabled = true;
    } else {
        quantitySelect.disabled = false;
    }
});

window.addEventListener('load', () => {
    db.collection("websiteState").doc("currentState").get()
        .then((doc) => {
            if (doc.exists) {
                const data = doc.data();
                totalCount.textContent = data.totalCount || 0;

                data.orders.forEach(order => {
                    const row = document.createElement('tr');
                    row.innerHTML = `<td>${order.name}</td><td>${order.yesNo}</td><td>${order.quantity === 0 ? '-' : order.quantity}</td>`;
                    tableBody.appendChild(row);
                });

                dailyOverview.innerHTML = data.dailyOverviewHtml || '';
                updateChart(data.dailyOverview);
            }
        })
        .catch((error) => {
            console.error("Fehler beim Laden des Zustands: ", error);
        });
});

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const yesNo = yesNoSelect.value;
    const name = document.getElementById('name').value.trim();
    const quantity = parseInt(quantitySelect.value);

    if (!yesNo || !name || (yesNo === 'Ja' && isNaN(quantity)) || quantity === 1000000) {
        alert('Eine Million Leberkäswecken sind leider nicht möglich!');
        return;
    }

    const row = document.createElement('tr');
    row.innerHTML = `<td>${name}</td><td>${yesNo}</td><td>${yesNo === 'Ja' ? quantity : '-'}</td>`;
    tableBody.appendChild(row);

    let currentTotal = parseInt(totalCount.textContent);
    if (yesNo === 'Ja') {
        currentTotal += quantity;
    }
    totalCount.textContent = currentTotal;

    showFunnyAnimation();

    saveStateToFirestore();

    form.reset();
    quantitySelect.disabled = false;
});

resetButton.addEventListener('click', () => {
    const password = prompt('Bitte gib das Passwort ein, um die Daten zurückzusetzen:');
    if (password === 'meister') {
        const date = new Date().toLocaleDateString();
        const total = parseInt(totalCount.textContent);

        db.collection("dailyOverview").add({
            date: date,
            total: total
        }).then(() => {
            db.collection("websiteState").doc("currentState").set({
                totalCount: 0,
                orders: [],
                dailyOverviewHtml: '',
                dailyOverview: [{ date: date, total: total }]
            }).then(() => {
                tableBody.innerHTML = '';
                totalCount.textContent = 0;
                dailyOverview.innerHTML = '';
                updateChart([{ date: date, total: total }]);
            });
        }).catch((error) => {
            console.error("Fehler beim Zurücksetzen der Daten: ", error);
        });
    } else {
        alert('Falsches Passwort. Zurücksetzen nicht möglich.');
    }
});

function saveStateToFirestore() {
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

    db.collection("websiteState").doc("currentState").set({
        totalCount: parseInt(totalCount.textContent),
        orders: orders,
        dailyOverviewHtml: dailyOverviewHtml
    }).then(() => {
        console.log("Der aktuelle Zustand wurde erfolgreich gespeichert.");
    }).catch((error) => {
        console.error("Fehler beim Speichern des Zustands: ", error);
    });
}

downloadCsvButton.addEventListener('click', () => {
    let csvContent = "data:text/csv;charset=utf-8,Name,Antwort,Anzahl\n";
    tableBody.querySelectorAll('tr').forEach(row => {
        let rowData = Array.from(row.querySelectorAll('td')).map(cell => cell.textContent).join(",");
        csvContent += rowData + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "leberkaeswecken_bestellungen.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

function updateChart(dailyOverviewData) {
    const labels = dailyOverviewData.map(entry => entry.date);
    const data = dailyOverviewData.map(entry => entry.total);

    const ctx = chartCanvas.getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Bestellungen pro Tag',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
