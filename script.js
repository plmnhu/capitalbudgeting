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
                <td><input type="number" class="inflow_${i}" value="0"></td>
                <td><input type="number" class="outflow_${i}" value="0"></td>
            </tr>`;
        }

        html += "</table>";
    }

    document.getElementById("tableArea").innerHTML = html;
    document.getElementById("npvButton").style.display = "block";
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

            let inflow = parseFloat(inflows[t-1].value) || 0;
            let outflow = parseFloat(outflows[t-1].value) || 0;

            npv += (inflow - outflow) / Math.pow(1 + rate, t);
        }

        resultText += `NPV Project ${p + 1} = ${npv.toFixed(2)} <br>`;
    }

    document.getElementById("result").innerHTML = resultText;
}