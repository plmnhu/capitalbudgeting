function createTable() {
    let years = document.getElementById("years").value;
    let topics = document.getElementById("topics").value;
    let html = "";

    for (let i = 0; i < topics; i++) {
        html += `<h3>Topic ${i + 1}</h3>`;
        html += `<table>
            <tr>
                <th>Year</th>
                <th>Inflow</th>
                <th>Outflow</th>
            </tr>`;

        for (let j = 1; j <= years; j++) {
            html += `<tr>
                <td>${j}</td>
                <td><input type="number" min="0" class="inflow_${i}" value="0"></td>
                <td><input type="number" min="0" class="outflow_${i}" value="0"></td>
            </tr>`;
        }
        html += "</table>";
    }

    document.getElementById("tableArea").innerHTML = html;
    document.getElementById("npvButton").style.display = "block";
    document.getElementById("chooseButton").style.display = "block";
}

function calculateNPV() {
    let rate = document.getElementById("rate").value / 100;
    let topics = document.getElementById("topics").value;
    let years = document.getElementById("years").value;
    let resultText = "";

    for (let p = 0; p < topics; p++) {
        let inflows = document.getElementsByClassName(`inflow_${p}`);
        let outflows = document.getElementsByClassName(`outflow_${p}`);
        let npv = 0;

        for (let t = 1; t <= years; t++) {
            let inflow = parseFloat(inflows[t - 1].value) || 0;
            let outflow = parseFloat(outflows[t - 1].value) || 0;
            npv += (inflow - outflow) / Math.pow(1 + rate, t);
        }

        resultText += `NPV Project ${p + 1} = ${npv.toFixed(2)} <br>`;
    }

    document.getElementById("npvResult").innerHTML = resultText;
}

function findBestCombination(projects, budget, years) {
    let n = projects.length;
    let maxNPV = -Infinity;
    let bestCombo = [];

    for (let mask = 0; mask < (1 << n); mask++) {
        let valid = true;
        let leftover = 0;

        for (let y = 0; y < years; y++) {
            let yearlyOutflow = 0;

            for (let p = 0; p < n; p++) {
                if (mask & (1 << p)) {
                    yearlyOutflow += projects[p].outflows[y];
                }
            }

            let availableBudget = budget + leftover;

            if (yearlyOutflow > availableBudget) {
                valid = false;
                break;
            }
            leftover = availableBudget - yearlyOutflow;
        }

        if (valid) {
            let totalNPV = 0;
            let chosen = [];

            for (let p = 0; p < n; p++) {
                if (mask & (1 << p)) {
                    totalNPV += projects[p].npv;
                    chosen.push(p + 1);
                }
            }

            if (totalNPV > maxNPV) {
                maxNPV = totalNPV;
                bestCombo = chosen;
            }
        }
    }

    return { bestNPV: maxNPV, bestProjects: bestCombo };
} 

function choosingProject() {
    let topics = parseInt(document.getElementById("topics").value);
    let years = parseInt(document.getElementById("years").value);
    let budget = parseFloat(document.getElementById("totalBudget").value);
    let rate = document.getElementById("rate").value / 100;
    let projects = [];

    for (let p = 0; p < topics; p++) {
        let inflows = document.getElementsByClassName(`inflow_${p}`);
        let outflows = document.getElementsByClassName(`outflow_${p}`);
        let npv = 0;
        let outflowArray = [];

        for (let y = 0; y < years; y++) {
            let inflow = parseFloat(inflows[y].value) || 0;
            let outflow = parseFloat(outflows[y].value) || 0;
            npv += (inflow - outflow) / Math.pow(1 + rate, y + 1);
            outflowArray.push(outflow);
        }

        projects.push({ npv: npv, outflows: outflowArray });
    }

    let result = findBestCombination(projects, budget, years);

    // ✅ Use = instead of += to avoid stacking old results
    document.getElementById("projectResult").innerHTML =
        `<br><br><b>Best Combination:</b> Project ${result.bestProjects}
         <br><b>Total NPV:</b> ${result.bestNPV.toFixed(2)}`;
}