document.getElementById('update-dsm').addEventListener('click', updateDSM);
document.getElementById('run').addEventListener('click', runSimulation);
document.getElementById('clear').addEventListener('click', clearAxes);

let costs = [];
let totalCostHistory = [];
let chart; // Variable to hold the Chart.js instance

function updateDSM() {
  let n = parseInt(document.getElementById('n').value);
  let d = parseInt(document.getElementById('d').value);

  // Ensure d does not exceed n
  if (d > n) {
    alert(`Dependencies (d) cannot be greater than components (n). Adjusting d to ${n}.`);
    d = n;
    document.getElementById('d').value = n; // Update input field to match
  }

  const dsmGrid = document.getElementById('dsm-grid');
  const rowLabels = document.getElementById('dsm-row-labels');
  const colLabels = document.getElementById('dsm-col-labels');

  dsmGrid.innerHTML = '';
  rowLabels.innerHTML = '';
  colLabels.innerHTML = '';

  dsmGrid.style.gridTemplateColumns = `repeat(${n}, auto)`;
  dsmGrid.style.gridTemplateRows = `repeat(${n}, auto)`;
  rowLabels.style.gridTemplateRows = `repeat(${n}, auto)`;
  colLabels.style.gridTemplateColumns = `repeat(${n}, auto)`;

  costs = Array(n).fill(0).map(() => Math.random());
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

  // Create a 2D array to store dependencies
  const matrix = Array.from({ length: n }, () => Array(n).fill(0));

  for (let i = 0; i < d; i++) {
    const dependencies = new Set();
    
    // Always mark the diagonal (1-1, 2-2, ...)
    dependencies.add(i);
    
    // Add `d - 1` extra dependencies in the column
    while (dependencies.size < d) {
      const randomRow = Math.floor(Math.random() * n);
      if (!dependencies.has(randomRow)) {
        dependencies.add(randomRow);
      }
    }

    // Apply dependencies to the matrix
    dependencies.forEach(row => {
      matrix[row][i] = 1;
    });
  }

  // Populate DSM grid with the matrix data
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const cell = document.createElement('div');
      cell.classList.add('dsm-cell');
      cell.style.backgroundColor = matrix[i][j] === 1 ? '#a31f34' : 'white';
      dsmGrid.appendChild(cell);
    }
  }
}




// Ensure the updateDSM function is called when needed
document.getElementById('update-dsm-button').addEventListener('click', updateDSM);

function runSimulation() {
  if (costs.length === 0) {
    alert('Please update DSM first.');
    return;
  }

  const n = costs.length;
  const d = parseInt(document.getElementById('d').value);
  const iterations = 1000; 
  totalCostHistory = [];

  for (let i = 0; i < iterations; i++) {
    const randomIndex = Math.floor(Math.random() * n);
    const oldCost = costs[randomIndex];
    const dependencyFactor = 1 + (d / n); // More dependencies -> Slower reduction

    // Generate new cost considering dependencies
    const newCost = oldCost - (Math.random() / dependencyFactor);

    if (newCost < oldCost) {
      costs[randomIndex] = Math.max(newCost, 0); // Ensure cost never goes negative
    }

    // Calculate total cost
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
