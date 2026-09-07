const weightInput = document.getElementById('weightInput');
const saveBtn = document.getElementById('saveBtn');
const avgBtn = document.getElementById('avgBtn');
const tableBody = document.getElementById('tableBody');
const weeklyAvgDiv = document.getElementById('weeklyAvg');
const totalChangeDiv = document.getElementById('totalChange');
const currentWeightDiv = document.getElementById('currentWeight');

// Zakładki i widoki
const showDaily = document.getElementById('showDaily');
const showWeekly = document.getElementById('showWeekly');
const dailyView = document.getElementById('dailyView');
const weeklyView = document.getElementById('weeklyView');
const weeklyTableBody = document.getElementById('weeklyTableBody');

// Przycisk zwijania historii
const toggleHistoryBtn = document.getElementById('toggleHistoryBtn');

let weightsData = JSON.parse(localStorage.getItem('myWeights')) || [];
let weeklyData = JSON.parse(localStorage.getItem('myWeeklyAverages')) || [];
let showAllHistory = false; // Flaga: false = pokazuje tylko 7, true = pokazuje wszystko

// Obsługa zakładek
if (showDaily && showWeekly) {
    showDaily.addEventListener('click', () => {
        dailyView.classList.remove('hidden');
        weeklyView.classList.add('hidden');
        showDaily.classList.add('active');
        showWeekly.classList.remove('active');
    });

    showWeekly.addEventListener('click', () => {
        weeklyView.classList.remove('hidden');
        dailyView.classList.add('hidden');
        showWeekly.classList.add('active');
        showDaily.classList.remove('active');
        renderWeeklyTable();
    });
}

// Kliknięcie przycisku rozwijania/zwijania historii
if (toggleHistoryBtn) {
    toggleHistoryBtn.addEventListener('click', () => {
        showAllHistory = !showAllHistory;
        toggleHistoryBtn.innerText = showAllHistory ? 'Zwiń starsze wpisy' : 'Pokaż starsze wpisy';
        renderTable();
    });
}

function renderTable() {
    tableBody.innerHTML = '';

    // 1. Górny kafelek
    if (weightsData.length > 0) {
        const latestWeight = parseFloat(weightsData[0].weight);
        currentWeightDiv.innerText = `Aktualna waga: ${latestWeight} kg`;

        const entryWithAvg = weightsData.find(entry => entry.average);
        if (entryWithAvg) {
            weeklyAvgDiv.innerText = `Ostatnia średnia z 7 dni: ${entryWithAvg.average} kg`;
        } else {
            weeklyAvgDiv.innerText = `Ostatnia średnia z 7 dni: Brak (kliknij przycisk)`;
        }

        const oldestWeight = parseFloat(weightsData[weightsData.length - 1].weight);
        const totalDiff = (latestWeight - oldestWeight).toFixed(1);

        if (totalDiff < 0) {
            totalChangeDiv.innerHTML = `Całkowita zmiana: <span class="green">${totalDiff} kg</span>`;
        } else if (totalDiff > 0) {
            totalChangeDiv.innerHTML = `Całkowita zmiana: <span class="red">+${totalDiff} kg</span>`;
        } else {
            totalChangeDiv.innerHTML = `Całkowita zmiana: 0.0 kg`;
        }
    } else {
        currentWeightDiv.innerText = `Aktualna waga: -`;
        weeklyAvgDiv.innerText = `Ostatnia średnia z 7 dni: -`;
        totalChangeDiv.innerText = `Całkowita zmiana: -`;
    }

    // 2. Obsługa widoczności przycisku "Pokaż starsze"
    if (weightsData.length > 7) {
        toggleHistoryBtn.classList.remove('hidden');
    } else {
        toggleHistoryBtn.classList.add('hidden');
        showAllHistory = false;
        toggleHistoryBtn.innerText = 'Pokaż starsze wpisy';
    }

    // 3. Rysowanie wierszy (ograniczenie do 7 lub całość)
    const entriesToDisplay = showAllHistory ? weightsData : weightsData.slice(0, 7);

    entriesToDisplay.forEach((entry, index) => {
        let changeText = '-';
        let changeClass = '';
        let avgChangeText = '-';
        let avgChangeClass = '';

        if (index < weightsData.length - 1) {
            const olderEntry = weightsData[index + 1];
            const diff = (parseFloat(entry.weight) - parseFloat(olderEntry.weight)).toFixed(1);

            if (diff < 0) {
                changeText = `${diff} kg`;
                changeClass = 'green';
            } else if (diff > 0) {
                changeText = `+${diff} kg`;
                changeClass = 'red';
            } else {
                changeText = '0.0 kg';
            }
        }

        if (entry.average) {
            const previousAvgEntry = weightsData.slice(index + 1).find(item => item.average);
            if (previousAvgEntry) {
                const avgDiff = (parseFloat(entry.average) - parseFloat(previousAvgEntry.average)).toFixed(1);
                if (avgDiff < 0) {
                    avgChangeText = `${avgDiff} kg`;
                    avgChangeClass = 'green';
                } else if (avgDiff > 0) {
                    avgChangeText = `+${avgDiff} kg`;
                    avgChangeClass = 'red';
                } else {
                    avgChangeText = '0.0 kg';
                }
            }
        }

        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${entry.date}</td>
            <td>${entry.weight} kg</td>
            <td>${entry.average ? entry.average + ' kg' : '-'}</td>
            <td class="${changeClass}">${changeText}</td>
            <td><button class="delete-btn" onclick="deleteEntry(${index})">Usuń</button></td>
            <td class="${avgChangeClass}">${avgChangeText}</td>
        `;
        tableBody.appendChild(newRow);
    });
}

renderTable();

// Zapisywanie wagi
saveBtn.addEventListener('click', function() {
    const weightValue = weightInput.value;
    if (!weightValue) {
        alert('Wpisz najpierw wagę!');
        return;
    }

    const today = new Date().toISOString().split('T')[0];
    const newEntry = { date: today, weight: weightValue };

    weightsData.unshift(newEntry);
    localStorage.setItem('myWeights', JSON.stringify(weightsData));
    renderTable();
    weightInput.value = '';
});

// Obliczanie średniej
avgBtn.addEventListener('click', function() {
    if (weightsData.length === 0) {
        alert('Brak wpisów!');
        return;
    }

    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));

    const recentEntries = weightsData.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= sevenDaysAgo && entryDate <= today;
    });

    if (recentEntries.length === 0) {
        alert('Brak wpisów z ostatnich 7 dni do wyliczenia średniej!');
        return;
    }

    let sum = 0;
    recentEntries.forEach(entry => sum += parseFloat(entry.weight));
    const average = (sum / recentEntries.length).toFixed(1);

    weightsData[0].average = average;
    localStorage.setItem('myWeights', JSON.stringify(weightsData));

    const todayStr = new Date().toISOString().split('T')[0];
    weeklyData.unshift({ date: todayStr, average: average });
    localStorage.setItem('myWeeklyAverages', JSON.stringify(weeklyData));

    renderTable();
    alert(`Obliczono i zapisano średnią: ${average} kg!`);
});

function deleteEntry(index) {
    weightsData.splice(index, 1);
    localStorage.setItem('myWeights', JSON.stringify(weightsData));
    renderTable();
}

function renderWeeklyTable() {
    if (!weeklyTableBody) return;
    weeklyTableBody.innerHTML = '';
    
    weeklyData.forEach((entry, index) => {
        let changeText = '-';
        let changeClass = '';

        if (index < weeklyData.length - 1) {
            const older = weeklyData[index + 1];
            const diff = (parseFloat(entry.average) - parseFloat(older.average)).toFixed(1);
            if (diff < 0) {
                changeText = `${diff} kg`;
                changeClass = 'green';
            } else if (diff > 0) {
                changeText = `+${diff} kg`;
                changeClass = 'red';
            } else {
                changeText = '0.0 kg';
            }
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry.date}</td>
            <td>${entry.average} kg</td>
            <td class="${changeClass}">${changeText}</td>
            <td><button class="delete-btn" onclick="deleteWeekly(${index})">Usuń</button></td>
        `;
        weeklyTableBody.appendChild(row);
    });
}

function deleteWeekly(index) {
    weeklyData.splice(index, 1);
    localStorage.setItem('myWeeklyAverages', JSON.stringify(weeklyData));
    renderWeeklyTable();
}