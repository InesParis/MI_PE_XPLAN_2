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
    let dependencies = parseInt(dependenciesInput.value);
    const mode = modeInput.value;

    if (isNaN(components) || isNaN(dependencies) || components < 2 || dependencies < 1) {
      alert("Please enter valid numbers for components and dependencies.");
      return;
    }
    // Defensive: dependencies cannot exceed components-1
    if (dependencies > components - 1) {
      dependencies = components - 1;
      dependenciesInput.value = dependencies;
      alert("Dependencies cannot exceed components minus one (no self-dependency). Adjusted automatically.");
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

    const simSeries = runSimulation(DSM, 200, dependencies);
    history.push(simSeries);
    // Reset after 3 runs: clear history, clear chart, and reset inputs
    if (history.length > 3) {
      history.length = 0;
      if (chart) {
        chart.destroy();
        chart = null;
      }
      // Optionally clear DSM and chart area
      const dsmDiv = document.getElementById("dsm");
      if (dsmDiv) dsmDiv.innerHTML = "";
      const ctx = document.getElementById("costChart");
      if (ctx) {
        ctx.getContext("2d").clearRect(0, 0, ctx.width, ctx.height);
      }
      // Reset input fields
      document.getElementById("components").value = "";
      document.getElementById("dependencies").value = "";
      alert("Simulation limit reached. Please enter new values for components and dependencies to start again.");
      return;
    }
    updateChart(history, dependencies, components);
  });

  function generateDSM(n, d, mode) {
    // Defensive: d cannot be more than n-1
    d = Math.min(d, n - 1);
    const DSM = Array.from({ length: n }, () => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      DSM[i][i] = 1;
      let outDegree = mode === "fixed" ? d : Math.floor(Math.random() * d) + 1;
      outDegree = Math.min(outDegree, n - 1); // cannot have more than n-1 out-degree
      // Get all possible targets except self
      const possibleTargets = [];
      for (let j = 0; j < n; j++) if (j !== i) possibleTargets.push(j);
      // Shuffle and pick outDegree targets
      for (let k = possibleTargets.length - 1; k > 0; k--) {
        const swap = Math.floor(Math.random() * (k + 1));
        [possibleTargets[k], possibleTargets[swap]] = [possibleTargets[swap], possibleTargets[k]];
      }
      for (let k = 0; k < outDegree; k++) {
        DSM[i][possibleTargets[k]] = 1;
      }
    }
    return DSM;
  }

  function renderDSM(DSM) {
    const container = document.getElementById("dsm");
    if (!container) return;
    container.innerHTML = "";
    // Set a CSS variable for responsive cell sizing
    container.style.setProperty('--dsm-size', DSM.length);
    const table = document.createElement("table");
    DSM.forEach(row => {
      const tr = document.createElement("tr");
      row.forEach(cell => {
        const td = document.createElement("td");
        td.style.backgroundColor = cell ? "#a31f34" : "#fff"; // MIT red
        td.style.border = "1px solid #ccc";
        // Remove fixed width/height here, CSS will handle it
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });
    container.appendChild(table);
  }

  function runSimulation(DSM, steps, dependencies) {
    const n = DSM.length;
    let costs = Array(n).fill(1 / n);
    const totalCosts = [];
    // Defensive: avoid infinite/NaN by checking DSM and costs
    if (!Array.isArray(DSM) || DSM.length === 0 || !Array.isArray(costs) || costs.length === 0) {
      for (let t = 0; t < steps; t++) totalCosts.push(1);
      return totalCosts;
    }
    for (let t = 0; t < steps; t++) {
      const i = Math.floor(Math.random() * n);
      const row = DSM[i];
      if (!row) {
        totalCosts.push(costs.reduce((sum, c) => sum + c, 0));
        continue;
      }
      const A_i = row.map((val, j) => val ? j : -1).filter(j => j !== -1);

      // Defensive: always update at least self if A_i is empty
      if (A_i.length === 0) {
        totalCosts.push(costs.reduce((sum, c) => sum + c, 0));
        continue;
      }

      const newCosts = [...costs];
      let newTotal = 0;
      // Defensive: dependencies can never be zero here, but just in case
      const exponent = dependencies > 0 ? 1 + (1 / dependencies) : 1;
      for (let idx = 0; idx < A_i.length; idx++) {
        const j = A_i[idx];
        let rand = Math.random();
        if (!isFinite(rand) || rand < 1e-8) rand = 1e-8;
        let val = Math.pow(rand, exponent);
        if (!isFinite(val) || val < 1e-8) val = 1e-4;
        newCosts[j] = val;
        newTotal += newCosts[j];
      }
      const currentTotal = A_i.reduce((sum, j) => sum + costs[j], 0);
      // Only update if newTotal < currentTotal and both are finite
      if (
        isFinite(newTotal) &&
        isFinite(currentTotal) &&
        newTotal < currentTotal &&
        !isNaN(newTotal) &&
        !isNaN(currentTotal)
      ) {
        for (let idx = 0; idx < A_i.length; idx++) {
          const j = A_i[idx];
          costs[j] = newCosts[j];
        }
      }
      let total = costs.reduce((sum, c) => sum + (isFinite(c) ? c : 0), 0);
      if (!isFinite(total) || total < 1e-8) total = 1e-4;
      totalCosts.push(total);
    }
    return totalCosts;
  }

  function updateChart(history, dependencies, components) {
    const colors = ['#a31f34', '#8a8b8c', '#d3d3d4', '#0074D9'];
    // Show up to 4 runs as lines with points
    const datasets = history.slice(-4).map((series, idx) => ({
      label: `Run ${history.length - history.slice(-4).length + idx + 1}`,
      type: 'line',
      data: series
        .map((y, i) => ({ x: i + 1, y: Math.max(y, 1e-6) }))
        // Only include points where y is less than 1 (to avoid flat line at top)
        .filter((point, i) => point.y < 0.9999 || i === 0), // always show first point
      borderColor: colors[idx % colors.length],
      backgroundColor: colors[idx % colors.length],
      fill: false,
      tension: 0.7,
      pointRadius: 3,
      pointStyle: 'circle',
      borderWidth: 2,
      showLine: true,
      order: 1
    }));

    const ctx = document.getElementById("costChart").getContext("2d");
    if (!ctx) return;

    // Find the min/max x and y for all visible points to set axis limits dynamically
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    datasets.forEach(ds => {
      ds.data.forEach(pt => {
        if (pt.x < minX) minX = pt.x;
        if (pt.x > maxX) maxX = pt.x;
        if (pt.y < minY) minY = pt.y;
        if (pt.y > maxY) maxY = pt.y;
      });
    });
    // Set some padding and sensible defaults
    minX = Math.max(1, Math.floor(minX));
    maxX = Math.max(10, Math.ceil(maxX));
    minY = Math.max(1e-6, minY * 0.8);
    maxY = 1; // Always cap at 1 for cost

    // Build grid squares as annotation boxes (log-log)
    const gridSquares = [];
    const gridRows = 6;
    const gridCols = 6;
    for (let i = 0; i < gridCols; i++) {
      for (let j = 0; j < gridRows; j++) {
        const xMin = minX * Math.pow((maxX / minX), i / gridCols);
        const xMax = minX * Math.pow((maxX / minX), (i + 1) / gridCols);
        const yMinBox = minY * Math.pow((maxY / minY), j / gridRows);
        const yMaxBox = minY * Math.pow((maxY / minY), (j + 1) / gridRows);
        gridSquares.push({
          type: 'box',
          xMin, xMax, yMin: yMinBox, yMax: yMaxBox,
          backgroundColor: (i + j) % 2 === 0 ? 'rgba(211,211,212,0.18)' : 'rgba(255,255,255,0.01)',
          borderWidth: 0
        });
      }
    }

    if (!chart) {
      chart = new Chart(ctx, {
        type: 'line',
        data: { datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          aspectRatio: 0.5,
          parsing: false,
          plugins: {
            legend: { display: true },
            tooltip: { enabled: true },
            annotation: {
              annotations: gridSquares
            }
          },
          layout: { padding: 20 },
          scales: {
            x: {
              type: 'logarithmic',
              base: 10,
              min: minX,
              max: maxX,
              title: { display: true, text: "# of Improvements Attempts", font: { size: 16 } },
              grid: {
                display: false
              },
              ticks: {
                callback: val => Number.isInteger(Math.log10(val)) ? `10^${Math.log10(val)}` : '',
                font: { size: 13 }
              }
            },
            y: {
              type: 'logarithmic',
              base: 10,
              min: minY,
              max: maxY,
              title: { display: true, text: "Cost", font: { size: 16 } },
              grid: {
                display: false
              },
              ticks: {
                callback: val => Number.isInteger(Math.log10(val)) ? `10^${Math.log10(val)}` : '',
                font: { size: 13 }
              }
            }
          },
          elements: {
            line: { borderWidth: 2 },
            point: { radius: 3 }
          }
        }
      });
    } else {
      chart.data.datasets = datasets;
      chart.options.plugins.annotation.annotations = gridSquares;
      chart.options.scales.x.type = 'logarithmic';
      chart.options.scales.x.min = minX;
      chart.options.scales.x.max = maxX;
      chart.options.scales.y.type = 'logarithmic';
      chart.options.scales.y.min = minY;
      chart.options.scales.y.max = maxY;
      chart.update();
    }
  }
});
