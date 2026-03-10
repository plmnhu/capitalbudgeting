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
    document.getElementById("resultButton").style.display = "block";
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

function calculateIRR() {
    let topics = document.getElementById("topics").value;
    let years = document.getElementById("years").value;
    let resultText = "";

    for (let p = 0; p < topics; p++) {
        let inflows = document.getElementsByClassName(`inflow_${p}`);
        let outflows = document.getElementsByClassName(`outflow_${p}`);
        let initial = parseFloat(outflows[0].value) || 0;
        let cashFlows = [-initial];

        for (let t = 0; t < years; t++) {
            let inflow = parseFloat(inflows[t].value) || 0;
            let outflow = parseFloat(outflows[t].value) || 0;
            let net = inflow - outflow;
            if (t === 0) {
                net += initial;  // adjust for initial in outflow[0]
            }
            cashFlows.push(net);
        }

        let irr = findIRR(cashFlows);
        if (irr !== null) {
            resultText += `IRR Project ${p + 1} = ${irr.toFixed(2)}% <br>`;
        } else {
            resultText += `IRR Project ${p + 1} = Not found <br>`;
        }
    }

    document.getElementById("irrResult").innerHTML = resultText;
}

function calculatePaybackPeriod() {
    let topics = document.getElementById("topics").value;
    let years = document.getElementById("years").value;
    let resultText = "";

    for (let p = 0; p < topics; p++) {
        let inflows = document.getElementsByClassName(`inflow_${p}`);
        let outflows = document.getElementsByClassName(`outflow_${p}`);
        let initial = parseFloat(outflows[0].value) || 0;
        let cashFlows = [-initial];

        for (let t = 0; t < years; t++) {
            let inflow = parseFloat(inflows[t].value) || 0;
            let outflow = parseFloat(outflows[t].value) || 0;
            let net = inflow - outflow;
            if (t === 0) {
                net += initial;  // adjust for initial in outflow[0]
            }
            cashFlows.push(net);
        }

        let payback = findPayback(cashFlows, initial);
        if (payback === Infinity) {
            resultText += `Payback Project ${p + 1} = Never <br>`;
        } else {
            resultText += `Payback Project ${p + 1} = ${payback.toFixed(2)} years <br>`;
        }
    }

    document.getElementById("paybackResult").innerHTML = resultText;
}

function findPayback(cashFlows, initial) {
    let cumulative = 0;
    for (let t = 1; t < cashFlows.length; t++) {
        cumulative += cashFlows[t];
        if (cumulative >= initial) {
            if (t === 1) return 1;
            let prevCum = cumulative - cashFlows[t];
            let fraction = (initial - prevCum) / cashFlows[t];
            return t + fraction;
        }
    }
    return Infinity;
}

function findIRR(cashFlows) {
    let low = -0.99; // allow negative IRR
    let high = 5;
    let tolerance = 0.0001;
    let maxIter = 100;

    for (let iter = 0; iter < maxIter; iter++) {
        let mid = (low + high) / 2;
        let npv = 0;
        for (let t = 0; t < cashFlows.length; t++) {
            npv += cashFlows[t] / Math.pow(1 + mid, t );
        }
        if (Math.abs(npv) < tolerance) {
            return mid * 100;
        }
        if (npv > 0) {
            low = mid;
        } else {
            high = mid;
        }
    }
    return null;
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

    
    document.getElementById("projectResult").innerHTML =
        `<b>Best Combination based on NPV:</b> ${result.bestProjects.length ? "Project " + result.bestProjects.join(", ") : "No projects can be funded"}
         <br><b>Total NPV:</b> ${result.bestNPV.toFixed(2)}`;
}

function calculateAll(){

    calculateNPV();

    calculateIRR();

    calculatePaybackPeriod();

    choosingProject();


}
