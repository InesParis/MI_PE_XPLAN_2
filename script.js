// Global Variables
let dsmMatrix = [];
let costsOverTime = [];
let currentTime = 0;

// Elements
const componentsInput = document.getElementById('components');
const dependencyInput = document.getElementById('dependency');
const generateButton = document.getElementById('generateDSM');
const dsmMatrixElement = document.getElementById('dsmMatrix');
const costGraphCanvas = document.getElementById('costGraph');

// Initialize Chart.js
const ctx = costGraphCanvas.getContext('2d');
const costGraph = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Cost Evolution',
      data: [],
      borderColor: '#005A60', // MIT Blue
      backgroundColor: 'rgba(0, 90, 96, 0.2)',
      fill: true,
    }]
  },
  options: {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Total Cost'
        },
        beginAtZero: true
      }
    }
  }
});

// Generate a random DSM Matrix
function generateDSMMatrix(components, dependencies) {
  dsmMatrix = [];
  for (let i = 0; i < components; i++) {
    const row = [];
    for (let j = 0; j < components; j++) {
      row.push(i === j ? 0 : Math.random() < (1 / dependencies));
    }
    dsmMatrix.push(row);
  }

  renderDSMMatrix();
}

// Render DSM as a heatmap
function renderDSMMatrix() {
  dsmMatrixElement.innerHTML = '';
  dsmMatrix.forEach(row => {
    row.forEach(value => {
      const cell = document.createElement('div');
      cell.classList.add('dsm-cell');
      cell.style.backgroundColor = value ? 'rgba(0, 90, 96, 0.5)' : 'rgba(0, 0, 0, 0.1)';
      dsmMatrixElement.appendChild(cell);
    });
  });
}

// Simulate cost evolution
function simulateCostEvolution() {
  const numComponents = parseInt(componentsInput.value);
  const numDependencies = parseInt(dependencyInput.value);

  let costs = Array(numComponents).fill(1); // Initial costs
  let totalCost = costs.reduce((acc, cost) => acc + cost, 0);
  costsOverTime.push(totalCost);

  const maxIterations = 100;
  for (let t = 1; t <= maxIterations; t++) {
    // Randomly choose a component to modify
    const i = Math.floor(Math.random() * numComponents);
    const affectedComponents = dsmMatrix[i].map((dep, idx) => dep ? idx : -1).filter(idx => idx !== -1);

    // Modify costs
    let newCosts = [...costs];
    affectedComponents.forEach(idx => {
      newCosts[idx] = Math.random(); // Random new cost
    });

    // Accept the modification if it reduces the total cost
    const newTotalCost = newCosts.reduce((acc, cost) => acc + cost, 0);
    if (newTotalCost < totalCost) {
      costs = newCosts;
      totalCost = newTotalCost;
    }

    // Log cost evolution
    costsOverTime.push(totalCost);
  }

  // Update the cost graph
  updateCostGraph();
}

// Update the cost graph with new data
function updateCostGraph() {
  costGraph.data.labels = Array.from({ length: costsOverTime.length }, (_, i) => i);
  costGraph.data.datasets[0].data = costsOverTime;
  costGraph.update();
}

// Event Listeners
generateButton.addEventListener('click', () => {
  const numComponents = parseInt(componentsInput.value);
  const numDependencies = parseInt(dependencyInput.value);

  // Generate DSM Matrix and simulate cost evolution
  generateDSMMatrix(numComponents, numDependencies);
  simulateCostEvolution();
});

