// JavaScript: DSM Model Logic

// Initialize the components with random costs between 0 and 1
let n = 5; // Number of components
let costs = [];

// Initialize components with random costs
for (let i = 0; i < n; i++) {
    costs.push(Math.random());
}

// Function to calculate the total cost of the technology
function calculateTotalCost() {
    return costs.reduce((acc, cost) => acc + cost, 0).toFixed(2);
}

// Function to randomly modify a component's cost
function modifyComponent() {
    // Pick a random component
    let index = Math.floor(Math.random() * n);
    
    // Generate a new random cost for the component
    let newCost = Math.random();

    // If the new cost is lower, accept the modification
    if (newCost < costs[index]) {
        costs[index] = newCost;
    }

    // Update the UI with the new costs and total cost
    updateUI();
}

// Function to update the display of costs and total cost
function updateUI() {
    // Update the costs display
    let componentsList = document.getElementById('components-list');
    componentsList.innerHTML = '';
    
    costs.forEach((cost, index) => {
        let listItem = document.createElement('li');
        listItem.textContent = `Component ${index + 1}: $${cost.toFixed(2)}`;
        componentsList.appendChild(listItem);
    });
    
    // Update the total cost
    let totalCost = document.getElementById('total-cost');
    totalCost.textContent = `Total Cost: $${calculateTotalCost()}`;
}

