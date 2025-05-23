document.addEventListener("DOMContentLoaded", () => {
  let chart;
  const history = [];
  let lastParams = {};

  document.getElementById("runSimulation").addEventListener("click", () => {
    const componentsInput = document.getElementById("components");
    const dependenciesInput = document.getElementById("dependencies");
    const modeInput = document.getElementById("outDegreeMode");
    if (!componentsInput || !dependenciesInput || !modeInput) return;

    const components = parseInt(componentsInput.value);
    const dependencies = parseInt(dependenciesInput.value);
    const mode = modeInput.value;

    if (isNaN(components) || isNaN(dependencies) || components < 2 || dependencies < 1) {
      alert("Please enter valid numbers for components and dependencies.");
      return;
    }
    if (dependencies > components) {
      alert("Dependencies cannot exceed components.");
      return;
    }

    // Reset chart/history if parameters change
    const paramsChanged =
      lastParams.components !== components ||
      lastParams.dependencies !== dependencies ||
      lastParams.mode !== mode;
    if (paramsChanged) {
      history.length = 0;
      if (chart) {
        chart.destroy();
        chart = null;
      }
      lastParams = { components, dependencies, mode };
    }

    const DSM = generateDSM(components, dependencies, mode);
    renderDSM(DSM);

    const simSeries = runSimulation(DSM, 200);
    history.push(simSeries);
    if (history.length > 3) history.shift();

    updateChart(history, dependencies, components);
  });

  function generateDSM(n, d, mode) {
    const DSM = Array.from({ length: n }, () => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      DSM[i][i] = 1;
      let outDegree = mode === "fixed" ? d : Math.floor(Math.random() * d) + 1;
      let targets = new Set();
      while (targets.size < outDegree) {
        let j = Math.floor(Math.random() * n);
        if (j !== i) targets.add(j);
      }
      targets.forEach(j => DSM[i][j] = 1);
    }
    return DSM;
  }

  function renderDSM(DSM) {
    const container = document.getElementById("dsm");
    if (!container) return;
    container.innerHTML = "";
    const table = document.createElement("table");
    DSM.forEach(row => {
      const tr = document.createElement("tr");
      row.forEach(cell => {
        const td = document.createElement("td");
        td.style.backgroundColor = cell ? "#a31f34" : "#fff";
        td.style.border = "1px solid #ccc";
        td.style.width = "12px";  // Reduced from 18px
td.style.height = "12px"; // Reduced from 18px
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
      const A_i = DSM[i].map((val, j) => val ? j : -1).filter(j => j !== -1);
      const newCosts = [...costs];
      let newTotal = 0;
     A_i.forEach(j => {
    // Modified cost calculation with dependency-based exponent
    const exponent = 1 + (1 / dependencies); // Inverse relationship
    newCosts[j] = Math.max(Math.pow(Math.random(), exponent), 1e-4);
    newTotal += newCosts[j];
  });
      const currentTotal = A_i.reduce((sum, j) => sum + costs[j], 0);
      if (newTotal < currentTotal) {
        A_i.forEach(j => costs[j] = newCosts[j]);
      }
      const total = Math.max(costs.reduce((sum, c) => sum + c, 0), 1e-4);
      totalCosts.push(total);
    }
    return totalCosts;
  }

  function updateChart(history, dependencies, components) {
    const colors = ['#a31f34', '#0074D9', '#2ECC40'];
    const datasets = history.map((series, idx) => ({ 
      tension: dependencies > 5 ? 0.4 : 0.2, // More curve for fewer dependencies
      borderWidth: dependencies > 5 ? 1.5 : 2,
      label: `Run ${idx + 1}`,
      type: 'line',
      data: series.map((y, i) => ({ x: i + 1, y: Math.max(y, 1e-4) })),
      borderColor: colors[idx % colors.length],
      backgroundColor: colors[idx % colors.length],
      fill: false,
      tension: 0,
      pointRadius: 3,
      pointBackgroundColor: colors[idx % colors.length],
      pointBorderColor: colors[idx % colors.length],
      borderWidth: 2,
      showLine: true,
      order: 1
    }));

    const ctx = document.getElementById("costChart").getContext("2d");
    if (!ctx) return;

    // Fixed axis ranges for a consistent "background grid"
    const minX = 1;
    const maxX = 200;
    const yMin = 1e-4;
    const yMax = 1;

    if (!chart) {
      chart = new Chart(ctx, {
        type: 'line',
        data: { datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          aspectRatio: 2 / 3,
          parsing: false,
          plugins: {
            legend: { display: true, labels: { boxWidth: 18, font: { size: 15 } } },
            tooltip: { enabled: true }
          },
          layout: { padding: 20 },
          scales: {
            x: {
              type: 'logarithmic',
              base: 10,
              min: minX,
              max: maxX,
              title: { display: true, text: "# of Improvement Attempts", font: { size: 16 } },
              grid: {
                color: "#bbb",
                tickColor: "#bbb",
                lineWidth: 2,
                drawBorder: true,
                borderDash: [],
              },
              ticks: {
                callback: val => Number.isInteger(Math.log10(val)) ? `10^${Math.log10(val)}` : '',
                autoSkip: false,
                font: { size: 13 },
                major: { enabled: true }
              }
            },
            y: {
              type: 'logarithmic',
              base: 10,
              min: yMin,
              max: yMax,
              title: { display: true, text: "Cost", font: { size: 16 } },
              grid: {
                color: "#bbb",
                tickColor: "#bbb",
                lineWidth: 2,
                drawBorder: true,
                borderDash: [],
              },
              ticks: {
                callback: val => Number.isInteger(Math.log10(val)) ? `10^${Math.log10(val)}` : '',
                autoSkip: false,
                font: { size: 13 },
                major: { enabled: true }
              }
            }
          },
          elements: {
            line: { borderWidth: 2 },
            point: { radius: 3, borderWidth: 1 }
          }
        }
      });
    } else {
      chart.data.datasets = datasets;
      chart.options.scales.x.min = minX;
      chart.options.scales.x.max = maxX;
      chart.options.scales.y.min = yMin;
      chart.options.scales.y.max = yMax;
      chart.update();
    }
  }
});