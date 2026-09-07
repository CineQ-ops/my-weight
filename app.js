const weightInput = document.getElementById('weightInput');
const saveBtn = document.getElementById('saveBtn');
const tableBody = document.getElementById('tableBody');

// 1. Pobieramy zapisane dane z localStorage lub tworzymy pustą tablicę, jeśli nic nie ma
let weightsData = JSON.parse(localStorage.getItem('myWeights')) || [];

// Funkcja, która rysuje tabelę na podstawie tablicy weightsData
function renderTable() {
    tableBody.innerHTML = '';

    weightsData.forEach((entry, index) => {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${entry.date}</td>
            <td>${entry.weight} kg</td>
            <td>-</td>
            <td>-</td>
            <td><button onclick="deleteEntry(${index})" style="background: #ff3b30; padding: 5px 10px; font-size: 14px;">Usuń</button></td>
        `;
        tableBody.appendChild(newRow);
    });
}

// Uruchomienie funkcji rysującej tabelę od razu po załadowaniu strony
renderTable();

// 2. Obsługa kliknięcia przycisku "Zapisz wagę"
saveBtn.addEventListener('click', function() {
    const weightValue = weightInput.value;

    if (!weightValue) {
        alert('Wpisz najpierw wagę!');
        return;
    }

    const today = new Date().toISOString().split('T')[0];

    // Tworzymy obiekt nowego wpisu
    const newEntry = {
        date: today,
        weight: weightValue
    };

    // Dodajemy wpis do tablicy
    weightsData.push(newEntry);

    // Zapisujemy całą tablicę w localStorage (zamieniając ją na tekst JSON)
    localStorage.setItem('myWeights', JSON.stringify(weightsData));

    // Odświeżamy widok tabeli
    renderTable();

    // Czścimy pole input
    weightInput.value = '';
});

function deleteEntry(index) {
    // Usuwamy 1 element z tablicy pod danym indeksem
    weightsData.splice(index, 1);

    // Zapisujemy zaktualizowaną tablicę do localStorage
    localStorage.setItem('myWeights', JSON.stringify(weightsData));

    // Odświeżamy tabelę
    renderTable();
}