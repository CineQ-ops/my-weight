const weightInput = document.getElementById('weightInput');
const saveBtn = document.getElementById('saveBtn');
const tableBody = document.getElementById('tableBody');

saveBtn.addEventListener('click', function() {
    const weightValue = weightInput.value;

    if (!weightValue) {
        alert('Wpisz najpierw wagę!');
        return;
    }

    const today = new Date().toISOString().split('T')[0];

    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${today}</td>
        <td>${weightValue} kg</td>
        <td>-</td>
        <td>-</td>
    `;

    tableBody.appendChild(newRow);
    weightInput.value = '';
});