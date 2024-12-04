document.getElementById('update-dsm').addEventListener('click', updateDSM);
document.getElementById('run').addEventListener('click', runSimulation);
document.getElementById('clear').addEventListener('click', clearAxes);

let costs = [];
let totalCostHistory = [];
let chart; // Variable to hold the Chart.js instance

function updateDSM() {
  const n = parseInt(document.getElementById('n').value);

  // DSM Grid setup
  const dsmGrid = document.getElementById('dsm-grid');
  const rowLabels = document.getElementById('dsm-row-labels');
  const colLabels = document.getElementById('dsm-col-labels');

  dsmGrid.innerHTML = ''; // Clear previous grid
  rowLabels.innerHTML = ''; // Clear row labels
  colLabels.innerHTML = ''; // Clear column labels

  dsmGrid.style.gridTemplateColumns = `repeat(${n}, auto)`;
  dsmGrid.style.gridTemplateRows = `repeat(${n}, auto)`;
  rowLabels.style.gridTemplateRows = `repeat(${n}, auto)`;
  colLabels.style.gridTemplateColumns = `repeat(${n}, auto)`;

  costs = Array(n).fill(0).map(() => Math.random()); // Initialize costs
  totalCostHistory = [];

  // Create row and column labels
  for (let i = 1; i <= n; i++) {
    const rowLabel = document.createElement('div');
    rowLabel.classList.add('dsm-label');
    rowLabel.textContent = i;
    rowLabels.appendChild(rowLabel);

    const colLabel = document.createElement('div');
    colLabel.classList.add('dsm-label');
    colLabel.textContent = i;
    colLabels.appendChild(colLabel);
  }

  // Populate DSM grid
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const cell = document.createElement('div');
      cell.classList.add('dsm-cell');
      cell.textContent = i === j ? "1" : ""; // Simple DSM identity matrix for now
      dsmGrid.appendChild(cell);
    }
  }
}

function runSimulation() {
  if (costs.length === 0) {
    alert('Please update DSM first.');
    return;
  }

  const iterations = 1000; // Number of iterations
  for (let i = 0; i < iterations; i++) {
    const randomIndex = Math.floor(Math.random() * costs.length);
    const oldCost = costs[randomIndex];
    const newCost = Math.random();

    if (newCost < oldCost) {
      costs[randomIndex] = newCost; // Accept lower cost
    }

    const totalCost = costs.reduce((acc, cost) => acc + cost, 0);
    totalCostHistory.push(totalCost);
  }

  plotCostEvolution();
}

function plotCostEvolution() {
  const ctx = document.getElementById('cost-chart').getContext('2d');

  // Clear the chart if it already exists
  if (chart) {
    chart.destroy();
  }

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: totalCostHistory.map((_, index) => index + 1),
      datasets: [{
        label: 'Total Cost',
        data: totalCostHistory,
        borderColor: 'rgba(163, 31, 52, 1)', // MIT red
        borderWidth: 2,
        fill: false,
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: 'Iterations' } },
        y: { title: { display: true, text: 'Cost' } },
      }
    }
  });
}

function clearAxes() {
  const canvas = document.getElementById('cost-chart');
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  totalCostHistory = [];

  if (chart) {
    chart.destroy();
    chart = null;
  }
}




