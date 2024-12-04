// script.js

document.getElementById('update-dsm').addEventListener('click', updateDSM);
document.getElementById('run').addEventListener('click', runSimulation);
document.getElementById('clear').addEventListener('click', clearAxes);

function updateDSM() {
  const n = parseInt(document.getElementById('n').value);
  const d = parseInt(document.getElementById('d').value);
  const method = document.getElementById('method').value;

  const dsmGrid = document.getElementById('dsm-grid');
  dsmGrid.innerHTML = ''; // Clear previous DSM

  dsmGrid.style.gridTemplateColumns = `repeat(${n}, auto)`;

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const cell = document.createElement('div');
      cell.classList.add('dsm-cell');
      cell.textContent = Math.random() < d / n ? 1 : 0; // Example logic
      if (Math.random() < d / n) cell.classList.add('active');
      dsmGrid.appendChild(cell);
    }
  }
}

function runSimulation() {
  const ctx = document.getElementById('cost-chart').getContext('2d');

  const data = {
    labels: Array.from({ length: 10 }, (_, i) => i + 1),
    datasets: [{
      label: 'Cost Over Time',
      data: Array.from({ length: 10 }, () => Math.random() * 100),
      borderColor: 'rgba(163, 31, 52, 1)', // MIT red
      borderWidth: 2,
      fill: false,
    }]
  };

  new Chart(ctx, {
    type: 'line',
    data,
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: '# of Improvements Attempted' } },
        y: { title: { display: true, text: 'Cost' }, type: 'logarithmic' },
      }
    }
  });
}

function clearAxes() {
  const dsmGrid = document.getElementById('dsm-grid');
  dsmGrid.innerHTML = '';

  const canvas = document.getElementById('cost-chart');
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}




