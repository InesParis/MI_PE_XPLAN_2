// JavaScript: DSM Model Logic with Dependency Heatmap

let n = 5; // Default number of components
let components = [];
let history = []; // To store the history for heatmap and line graph
let dependencies = []; // Array to store component dependencies

// Function to initialize components and run the simulation
function initializeSimulation() {
    components = [];
    history = []; // Clear previous history

    // Initialize components with random costs
    for (let i = 0; i < n; i++) {
        components.push(Math.random());
    }

    // Simulate cost changes for a fixed number of trials (e.g., 100)
    for (let trial = 0; trial < 100; trial++) {
        modifyComponent(); // Modify a random component in each trial
    }

    // Update the UI and the charts
    updateUI();
    updateDependencyHeatmap(); // Show dependencies heatmap
    updateLineGraph(); // Show the line graph of cost evolution
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

// Function to update the dependency heatmap (showing component dependencies as a matrix)
function updateDependencyHeatmap() {
    let heatmapData = {
        labels: Array.from({ length: n }, (_, i) => `Component ${i + 1}`),
        datasets: [{
            label: 'Component Dependencies',
            data: generateDependencyMatrix(),
            backgroundColor: function(context) {
                const value = context.raw;
                return value > 0 ? `rgba(255, 99, 132, ${value})` : 'rgba(0, 0, 0, 0)';
            },
            borderColor: 'black',
            borderWidth: 1
        }]
    };

    let heatmapCtx = document.getElementById('heatmap').getContext('2d');
    if (window.heatmapChart) window.heatmapChart.destroy(); // Destroy the previous chart to prevent stacking
    window.heatmapChart = new Chart(heatmapCtx, {
        type: 'matrix',
        data: heatmapData,
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    type: 'category',
                    labels: Array.from({ length: n }, (_, i) => `Component ${i + 1}`)
                },
                y: {
                    type: 'category',
                    labels: Array.from({ length: n }, (_, i) => `Component ${i + 1}`)
                }
            }
        }
    });
}

// Function to generate the dependency matrix based on the `dependencies` array
function generateDependencyMatrix() {
    let matrix = [];
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            // If component `i` depends on component `j`, mark the matrix with a value
            matrix.push(dependencies[i] && dependencies[i].includes(j) ? 1 : 0);
        }
    }
    return matrix;
}

// Function to update the line graph (showing total cost over time)
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
    initializeSimulation(); // Re-run the simulation with the new number of components
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
    initializeSimulation(); // Re-run the simulation with the new dependencies
}

// Initialize the simulation when the page is loaded, but keep graphs empty initially
window.onload = function() {
    updateUI(); // To show the UI with the default values
    updateDependencyHeatmap(); // Empty graph initially for dependency heatmap
    updateLineGraph(); // Empty graph initially for line graph
};



