class TechnologyModel {
    constructor(n, dependentComponents, modifyingComponents, t_steps = 200) {
        this.n = n;  // Number of components
        this.t_steps = t_steps;  // Number of innovation steps
        this.dsm = this.generateDSM(dependentComponents, modifyingComponents);  // Generate DSM matrix

        // Initialize costs randomly between 0 and 1
        this.costs = Array.from({ length: n }, () => Math.random());
    }

    // Function to generate the DSM based on modifying and dependent components
    generateDSM(dependentComponents, modifyingComponents) {
        let dsm = Array.from({ length: this.n }, () => Array.from({ length: this.n }, () => 0));

        // Process dependent components
        dependentComponents.forEach(pair => {
            const [i, j] = pair.split(',').map(Number);
            if (i !== j) {
                dsm[i - 1][j - 1] = 1; // i depends on j
            }
        });

        // Process modifying components
        modifyingComponents.forEach(pair => {
            const [i, j] = pair.split(',').map(Number);
            if (i !== j) {
                dsm[j - 1][i - 1] = 1; // j modifies i
            }
        });

        return dsm;
    }

    updateCosts() {
        // Step 1: Pick a random component i
        let i = Math.floor(Math.random() * this.n);

        // Step 2: Find components that depend on i
        let Ai = this.dsm[i].map((val, idx) => val === 1 ? idx : -1).filter(idx => idx !== -1);

        // Step 3: Propose new costs for components
        let newCosts = Ai.map(() => Math.random() * 0.5); // Reduced random range for demonstration

        // Calculate current sum of costs
        let currentSum = Ai.reduce((sum, idx) => sum + this.costs[idx], 0);
 
        // Calculate new sum of costs
        let newSum = newCosts.reduce((sum, cost) => sum + cost, 0);

        // Step 4: Accept or reject based on the total cost
        if (newSum < currentSum) {
            Ai.forEach((idx, idx2) => {
                this.costs[idx] = newCosts[idx2];
            });
            return true;
        }
        return false;
    }

    runSimulation() {
        let costHistory = [this.costs.reduce((sum, cost) => sum + cost, 0)];
        for (let i = 0; i < this.t_steps; i++) {
            this.updateCosts();
            costHistory.push(this.costs.reduce((sum, cost) => sum + cost, 0));
        }
        return costHistory;
    }
}

// Handling form submission
document.getElementById("simulation-form").addEventListener("submit", function(event) {
    event.preventDefault();

    // Get user inputs
    let n = parseInt(document.getElementById("n").value);  // Number of components
    let dependentComponents = document.getElementById("dependent-components").value.split(";").map(pair => pair.trim());
    let modifyingComponents = document.getElementById("modifying-components").value.split(";").map(pair => pair.trim());

    // Create the model
    let model = new TechnologyModel(n, dependentComponents, modifyingComponents);

    // Run the simulation
    let costHistory = model.runSimulation();

    // Plot Total Cost Evolution
    let costTrace = {
        x: Array.from({ length: model.t_steps + 1 }, (_, i) => i),
        y: costHistory,
        mode: 'lines',
        type: 'scatter'
    };
    let costLayout = {
        title: 'Total Cost Evolution Over Time',
        xaxis: { title: 'Innovation Attempts' },
        yaxis: { title: 'Total Cost of Technology' }
    };
    Plotly.newPlot('cost-evolution', [costTrace], costLayout);

    // Plot DSM Heatmap
    let dsmData = {
        z: model.dsm,
        colorscale: 'Blues',
        showscale: true
    };
    let dsmLayout = {
        title: 'Design Structure Matrix (DSM)',
        xaxis: { title: 'Component Index' },
        yaxis: { title: 'Component Index' }
    };
    Plotly.newPlot('dsm-heatmap', [dsmData], dsmLayout);
});

document.getElementById("simulation-form").addEventListener("submit", function(event) {
    event.preventDefault(); 
    
    // Get user inputs
    const n = parseInt(document.getElementById("n").value); // Number of components
    const gamma = parseFloat(document.getElementById("gamma").value); // Gamma value
    const t_steps = parseInt(document.getElementById("t_steps").value); // Number of steps

    // Generate a random Design Structure Matrix (DSM) based on n
    const dsm = generateDSM(n);
    
    // Plot DSM heatmap
    plotHeatmap(dsm);
    
    // Run simulation and log cost evolution (just a placeholder for now)
    const costHistory = runSimulation(n, gamma, t_steps, dsm);
    console.log("Cost History: ", costHistory);
});

// Function to generate a random DSM
function generateDSM(n) {
    let dsm = [];
    for (let i = 0; i < n; i++) {
        let row = [];
        for (let j = 0; j < n; j++) {
            if (i === j) {
                row.push(0); // No self-dependence
            } else {
                row.push(Math.random() < 0.2 ? 1 : 0); // Random dependencies
            }
        }
        dsm.push(row);
    }
    return dsm;
}

// Function to plot DSM as a heatmap
function plotHeatmap(dsm) {
    const trace = {
        z: dsm, // Data for the heatmap
        type: 'heatmap', // Chart type
        colorscale: 'Viridis' // Color scale for the heatmap
    };

    const layout = {
        title: 'Design Structure Matrix Heatmap',
        xaxis: { title: 'Component Index' },
        yaxis: { title: 'Component Index' }
    };

    // Create the heatmap in the 'dsm-heatmap' div
    Plotly.newPlot('dsm-heatmap', [trace], layout);
}

// Simulate the cost evolution (just a placeholder)
function runSimulation(n, gamma, t_steps, dsm) {
    // Dummy simulation logic for the demonstration
    let costHistory = [];
    let costs = Array(n).fill().map(() => Math.random()); // Random initial costs
    for (let step = 0; step < t_steps; step++) {
        // Update costs here based on some logic (you can replace this with your actual model)
        let totalCost = costs.reduce((sum, cost) => sum + cost, 0);
        costHistory.push(totalCost);
    }
    return costHistory;
}
