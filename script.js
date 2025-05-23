let chart;
const history = [];

document.getElementById("runSimulation").addEventListener("click", () => {
  const n = parseInt(document.getElementById("components").value);
  const d = parseInt(document.getElementById("dependencies").value);
  const mode = document.getElementById("outDegreeMode").value;

  if (d > n) {
    alert("Dependencies cannot exceed components.");
    return;
  }

  const DSM = generateDSM(n, d, mode);
  renderDSM(DSM);
  const costSeries = runSimulation(DSM, 200);
  updateChart(costSeries);
});

function generateDSM(n, d, mode) {
  const DSM = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    DSM[i][i] = 1;
    let targets = new Set();
    while (targets.size < (mode === "fixed" ? d : Math.floor(Math.random() * d) + 1)) {
      let j = Math.floor(Math.random() * n);
      if (j !== i) targets.add(j);
    }
    targets.forEach(j => DSM[j][i] = 1);
  }
  return DSM;
}

function renderDSM(DSM) {
  const container = document.getElementById("dsm");
  container.innerHTML = "";
  const table = document.createElement("table");
  DSM.forEach(row => {
    const tr = document.createElement("tr");
    row.forEach(cell => {
      const td = document.createElement("td");
      td.style.backgroundColor = cell ? "#333" : "#fff";
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });
  container.appendChild(table);
}

function runSimulation(DSM, steps) {
  const n = DSM.length;
  let costs = Array(n).fill(1 / n);
  const totalCosts = [];

  for (let t = 0; t < steps; t++) {
    const i = Math.floor(Math.random() * n);
    const A_i = DSM.map((_, j) => DSM[j][i] ? j : -1).filter(j => j !== -1);
    const newCosts = [...costs];
    let newTotal = 0;
    A_i.forEach(j => {
      newCosts[j] = Math.pow(Math.random(), 1);  // γ = 1
      newTotal += newCosts[j];
    });
    const currentTotal = A_i.reduce((sum, j) => sum + costs[j], 0);
    if (newTotal < currentTotal) {
      A_i.forEach(j => costs[j] = newCosts[j]);
    }
    totalCosts.push(costs.reduce((sum, c) => sum + c, 0));
  }
  return totalCosts;
}

function updateChart(costSeries) {
  history.push(costSeries);
  if (history.length > 3) history.shift();

  const labels = costSeries.map((_, i) => i);
  const datasets = history.map((series, idx) => ({
    label: `Run ${history.length - 3 + idx + 1}`,
    data: series,
    fill: false,
    borderColor: ['#0077cc', '#ff9933', '#66cc66'][idx % 3],
    tension: 0.4,
  }));

  if (chart) chart.destroy();
  const ctx = document.getElementById("costChart").getContext("2d");
  chart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { min: 0, title: { display: true, text: "Total Cost" }},
        x: { title: { display: true, text: "Time (steps)" }}
      }
    }
  });
}