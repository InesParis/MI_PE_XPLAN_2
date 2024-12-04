// JavaScript: DSM Model Logic with Line Graph and Heatmap

let n = 5; // Default number of components
let components = [];
let history = []; // To store the history for heatmap and line graph
let dependencies = []; // Array to store component dependencies

// Initialize components with random costs
function initializeComponents() {
    components = [];
    for (let i = 0; i < n; i++) {
        components.push(Math.random());
    }
    history = []; // Reset history when components are reinitialized
    updateUI();
    updateHeatmap();
    updateLineGraph();
}

// Function to calculate the total cost of the technology
function calculateTotalCost() {
    return components.reduce((acc, cost) => acc + cost, 0).toFixed(2);
}

// Function to randomly modify a component's cost and handle dependencies
function modifyComponent() {
    let index = Math.floor(Math.random() * n);
    
    // Generate a new random cost for the component
    let newCost = Math.random();

    // If the new cost is lower, accept the modification
    if (newCost < components[index]) {
        components[index] = newCost;
        
        // If the component has dependencies, modify those as well
        if (dependencies[index]) {
            dependencies[index].forEach(dep => {
                components[dep] = Math.random(); // Random modification of dependent component
            });
        }
    }

    // Store the current costs and total cost history
    history.push({
        costs: [...components],
        totalCost: calculateTotalCost()
    });

    updateUI();
    updateHeatmap();
    updateLineGraph();
}

// Function to update the UI with current costs
function updateUI() {
    let componentsList = document.getElementById('components-list');
    componentsList.innerHTML = '';
    
    components.forEach((cost, index) => {
        let listItem = document.createElement('li');
        listItem.textContent = `Component ${index + 1}: $${cost.toFixed(2)}`;
        componentsList.appendChild(listItem);
    });

    let totalCost = document.getElementById('total-cost');
    totalCost.textContent = `Total Cost: $${calculateTotalCost()}`;
}

// Function to update the heatmap (using Chart.js)
function updateHeatmap() {
    let heatmapData = {
        labels: Array.from({ length: n }, (_, i) => `Component ${i + 1}`),
        datasets: [{
            label: 'Component Costs',
            data: components,
            backgroundColor: components.map(cost => `rgba(${Math.floor(cost * 255)}, 100, 150, 0.7)`),
            borderColor: 'black',
            borderWidth: 1
        }]
    };

    let heatmapCtx = document.getElementById('heatmap').getContext('2d');
    if (window.heatmapChart) window.heatmapChart.destroy(); // Destroy the previous chart to prevent stacking
    window.heatmapChart = new Chart(heatmapCtx, {
        type: 'bar',
        data: heatmapData,
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    beginAtZero: true
                },
                y: {
                    max: 1,
                    min: 0,
                    stepSize: 0.1
                }
            }
        }
    });
}

// Function to update the line graph (using Chart.js)
function updateLineGraph() {
    let lineData = {
        labels: history.map((_, index) => index + 1),
        datasets: [{
            label: 'Total Cost Over Time',
            data: history.map(item => parseFloat(item.totalCost)),
            borderColor: 'rgba(0, 123, 255, 0.7)',
            fill: false,
            tension: 0.1
        }]
    };

    let lineGraphCtx = document.getElementById('line-graph').getContext('2d');
    if (window.lineGraphChart) window.lineGraphChart.destroy(); // Destroy the previous chart to prevent stacking
    window.lineGraphChart = new Chart(lineGraphCtx, {
        type: 'line',
        data: lineData,
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Trial Number' }
                },
                y: {
                    title: { display: true, text: 'Total Cost' }
                }
            }
        }
    });
}

// Function to handle custom number of components
function setNumberOfComponents() {
    n = parseInt(document.getElementById('num-components').value);
    initializeComponents();
}

// Function to handle setting dependencies
function setDependencies() {
    dependencies = [];
    let depInput = document.getElementById('dependencies').value;
    let depArray = depInput.split(',').map(item => item.trim());
    depArray.forEach(dep => {
        let [from, to] = dep.split('->').map(item => item.trim());
        from = parseInt(from) - 1;
        to = parseInt(to) - 1;
        if (!dependencies[from]) dependencies[from] = [];
        dependencies[from].push(to);
    });
    initializeComponents();
}



