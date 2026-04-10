/**
 * RCC SLAB DESIGN CALCULATOR – IS 456:2000
 * Separate files version (HTML + CSS + JS)
 * Team: Adnan Shaikh (40), Sameer Ahmad Pala (42), Jay Deshmukh (43), Aijaz Ahmad (24)
 * Guided by: Dr. Pradeep B. Kodag
 * Bharati Vidyapeeth College of Engineering, Pune
 */

const DESIGN_STEPS = [
    { id: 1, number: "01", title: "Slab Type", icon: "🔍", desc: "Determine whether the slab is one-way or two-way based on span ratio.", formula: `Ly / Lx ≤ 2.0 → TWO-WAY SLAB<br>Ly / Lx > 2.0 → ONE-WAY SLAB<br>(IS 456 Clause 24.1)`, note: "Two-way slabs distribute load in both directions and are more economical." },
    { id: 2, number: "02", title: "Thickness & Effective Depth", icon: "📏", desc: "Calculate effective depth for reinforcement placement.", formula: `d = D − clear cover − (φ / 2)`, note: "Effective depth is used in all moment and shear calculations." },
    { id: 3, number: "03", title: "Load Calculation", icon: "📦", desc: "Compute self-weight, total service load and factored load.", formula: `Self-weight = (D/1000) × unit weight<br>w = Self + FF + LL<br>w<sub>u</sub> = 1.5 × w (Limit State)`, note: "Factored load as per IS 456 load combination 1.5(DL+LL)." },
    { id: 4, number: "04", title: "Bending Moment", icon: "📐", desc: "Calculate design moments Mx and My using IS 456 Table 26.", formula: `M<sub>x</sub> = αx × wu × Lx²<br>M<sub>y</sub> = αy × wu × Lx²`, note: "αx & αy taken from Table 26 depending on support conditions and Ly/Lx." },
    { id: 5, number: "05", title: "Depth Check", icon: "📏", desc: "Verify if provided depth is adequate for bending.", formula: `d<sub>req</sub> = √(Mu / (0.138 × fck × 1000))`, note: "0.138 is limiting moment factor for Fe415 (IS 456 Annex G)." },
    { id: 6, number: "06", title: "Steel Reinforcement", icon: "🛠", desc: "Calculate required Ast in both directions.", formula: `Ast = Mu / (0.87 × fy × j × d)<br>Ast,min = 0.12% × 1000 × D (HYSD bars)`, note: "Maximum spacing limited to min(3d, 300 mm) as per Clause 26.3.3." },
    { id: 7, number: "07", title: "Deflection Check", icon: "📉", desc: "Ensure serviceability limit for deflection is satisfied.", formula: `Actual L/d = (Lx × 1000) / d<br>Allowable = 20 × modification factor (basic for simply supported)`, note: "Modification factor from Fig. 4 of IS 456 based on % tension steel." },
    { id: 8, number: "08", title: "Shear Check", icon: "⚖️", desc: "Check nominal shear stress against permissible value.", formula: `Vu = wu × Lx / 2<br>τv = Vu / d<br>τc from Table 19 (depends on pt & fck)`, note: "Shear rarely governs in slabs but must be verified." }
];

function renderSidebar() {
    const container = document.getElementById('steps-list');
    container.innerHTML = '';
    DESIGN_STEPS.forEach(step => {
        const div = document.createElement('div');
        div.className = 'step-item';
        div.innerHTML = `
            <div class="step-number">${step.number}</div>
            <div class="step-title">${step.icon} ${step.title}</div>
        `;
        div.onclick = () => showStepModal(step);
        container.appendChild(div);
    });
}

function showStepModal(step) {
    document.getElementById('modal-title').innerHTML = `${step.icon} Step ${step.number}: ${step.title}`;
    document.getElementById('modal-body').innerHTML = `
        <p style="margin-bottom:1.5rem;font-size:1.1rem;">${step.desc}</p>
        <div style="background:#f8fafc;padding:1rem;border-radius:12px;margin-bottom:1.5rem;">
            <strong>Formula used in IS 456:2000</strong><br>
            <div class="formula" style="background:white;margin-top:8px;">${step.formula}</div>
        </div>
        <p style="color:#475569;">${step.note}</p>
        <div style="margin-top:2rem;text-align:center;font-size:0.85rem;color:#64748b;">
            This step is automatically computed when you click <strong>Calculate Design</strong>
        </div>
    `;
    document.getElementById('step-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('step-modal').style.display = 'none';
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.style.display = sidebar.style.display === 'none' ? 'block' : 'none';
}

function parseSpan(input) {
    const str = input.trim().toLowerCase();
    if (str.includes("'") || str.includes("ft") || str.includes('"')) {
        let feet = 0, inches = 0;
        const ftMatch = str.match(/(\d+(\.\d+)?)['ft]/);
        if (ftMatch) feet = parseFloat(ftMatch[1]);
        const inMatch = str.match(/(\d+(\.\d+)?)["in]/);
        if (inMatch) inches = parseFloat(inMatch[1]);
        const totalFeet = feet + (inches / 12);
        return totalFeet * 0.3048;
    }
    return parseFloat(str) || 0;
}

function suggestCoefficients() {
    const lx = parseSpan(document.getElementById('lx').value);
    const ly = parseSpan(document.getElementById('ly').value);
    if (!lx || !ly) return alert("Please enter valid spans first!");
    const ratio = ly / lx;
    const support = parseInt(document.getElementById('support-type').value);
    let alphaX = 0.062, alphaY = 0.035;
    if (support === 2) {
        if (ratio <= 1.0) { alphaX = 0.035; alphaY = 0.035; }
        else if (ratio <= 1.2) { alphaX = 0.047; alphaY = 0.032; }
        else if (ratio <= 1.4) { alphaX = 0.057; alphaY = 0.028; }
        else if (ratio <= 1.6) { alphaX = 0.062; alphaY = 0.024; }
        else if (ratio <= 1.8) { alphaX = 0.064; alphaY = 0.020; }
        else { alphaX = 0.072; alphaY = 0.016; }
    }
    document.getElementById('alpha-x').value = alphaX.toFixed(3);
    document.getElementById('alpha-y').value = alphaY.toFixed(3);
    
    const toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#10b981;color:white;padding:12px 24px;border-radius:9999px;box-shadow:0 10px 15px -3px rgb(16 185 129);z-index:9999;';
    toast.textContent = `✅ αx = ${alphaX}, αy = ${alphaY} loaded from IS 456 Table 26`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2800);
}

function calculateSlab() {
    const Lx = parseSpan(document.getElementById('lx').value);
    const Ly = parseSpan(document.getElementById('ly').value);
    const fck = parseFloat(document.getElementById('fck').value);
    const fy = parseFloat(document.getElementById('fy').value);
    const unitWeight = parseFloat(document.getElementById('unit-weight').value);
    const ffLoad = parseFloat(document.getElementById('ff-load').value);
    const llLoad = parseFloat(document.getElementById('ll-load').value);
    const D = parseFloat(document.getElementById('thickness').value);
    const clearCover = parseFloat(document.getElementById('clear-cover').value);
    const phi = parseFloat(document.getElementById('bar-dia').value);
    const alphaX = parseFloat(document.getElementById('alpha-x').value);
    const alphaY = parseFloat(document.getElementById('alpha-y').value);
    const j = parseFloat(document.getElementById('j-factor').value);

    if (!Lx || !Ly || Lx <= 0 || Ly <= 0) {
        alert("❌ Please enter valid spans!");
        return;
    }
    if (D < 80) {
        document.getElementById('input-warning').style.display = 'block';
    } else {
        document.getElementById('input-warning').style.display = 'none';
    }

    const ratio = Ly / Lx;
    const isTwoWay = ratio <= 2;

    const slabTypeText = isTwoWay ? 
        `TWO-WAY SLAB (Ly/Lx = ${ratio.toFixed(2)} ≤ 2)` : 
        `ONE-WAY SLAB (Ly/Lx = ${ratio.toFixed(2)} > 2)`;

    const d = D - clearCover - (phi / 2);

    const selfWeight = (D / 1000) * unitWeight;
    const serviceLoad = selfWeight + ffLoad + llLoad;
    const wu = 1.5 * serviceLoad;

    let Mx = 0, My = 0;
    if (isTwoWay) {
        Mx = alphaX * wu * Lx * Lx;
        My = alphaY * wu * Lx * Lx;
    } else {
        Mx = wu * Lx * Lx / 8;
        My = 0;
    }

    const MuMax = Math.max(Mx, My);
    let R = fy <= 415 ? 0.138 : 0.133;
    const dReq = Math.sqrt((MuMax * 1e6) / (R * fck * 1000));
    const depthSafe = d >= dReq;

    let AstX = (Mx * 1e6) / (0.87 * fy * j * d);
    const AstMin = 0.0012 * 1000 * D;
    AstX = Math.max(AstX, AstMin);

    let AstY = (My * 1e6) / (0.87 * fy * j * d);
    AstY = Math.max(AstY, AstMin);

    const areaBar = Math.PI * Math.pow(phi, 2) / 4;
    const maxSpacing = Math.min(3 * d, 300);

    let spacingX = (1000 * areaBar) / AstX;
    spacingX = Math.min(spacingX, maxSpacing);
    spacingX = Math.floor(spacingX / 10) * 10;

    let spacingY = (1000 * areaBar) / AstY;
    spacingY = Math.min(spacingY, maxSpacing);
    spacingY = Math.floor(spacingY / 10) * 10;

    const actualLd = (Lx * 1000) / d;
    const allowableLd = 20 * 1.4;
    const deflectionSafe = actualLd <= allowableLd;

    const Vu = wu * Lx / 2;
    const tauV = Vu / d;
    const pt = (AstX / (1000 * d)) * 100;
    let tauC = 0.36 * Math.sqrt(fck / 20);
    if (pt > 0.5) tauC = 0.46 * Math.sqrt(fck / 20);
    if (pt > 0.75) tauC = 0.51 * Math.sqrt(fck / 20);
    const shearSafe = tauV < tauC;

    // Show output
    const output = document.getElementById('output-panel');
    output.classList.add('show');

    document.getElementById('slab-type-display').innerHTML = `
        ${slabTypeText} 
        <span class="badge ${isTwoWay ? 'badge-safe' : 'badge-warning'}" style="margin-left:12px;">${isTwoWay ? '✅ TWO-WAY' : '⚠️ ONE-WAY'}</span>
    `;

    const statusHTML = `
        <div class="status-card"><span>Depth</span><span class="badge ${depthSafe ? 'badge-safe' : 'badge-unsafe'}">${depthSafe ? 'SAFE' : 'UNSAFE'}</span></div>
        <div class="status-card"><span>Deflection</span><span class="badge ${deflectionSafe ? 'badge-safe' : 'badge-unsafe'}">${deflectionSafe ? 'SAFE' : 'NOT SAFE'}</span></div>
        <div class="status-card"><span>Shear</span><span class="badge ${shearSafe ? 'badge-safe' : 'badge-unsafe'}">${shearSafe ? 'SAFE' : 'NOT SAFE'}</span></div>
        <div class="status-card"><span>Reinforcement</span><span class="badge badge-safe">PROVIDED</span></div>
    `;
    document.getElementById('status-grid').innerHTML = statusHTML;

    document.getElementById('d-value').innerHTML = `<strong>${d.toFixed(1)} mm</strong>`;
    document.getElementById('self-weight').innerHTML = `<strong>${selfWeight.toFixed(2)} kN/m²</strong>`;
    document.getElementById('service-load').innerHTML = `<strong>${serviceLoad.toFixed(2)} kN/m²</strong>`;
    document.getElementById('factored-load').innerHTML = `<strong>${wu.toFixed(2)} kN/m²</strong>`;
    document.getElementById('mx-value').innerHTML = `<strong>${Mx.toFixed(3)} kNm/m</strong>`;
    document.getElementById('my-value').innerHTML = `<strong>${My.toFixed(3)} kNm/m</strong>`;
    document.getElementById('d-req-value').innerHTML = `<strong>${dReq.toFixed(1)} mm</strong>`;

    document.getElementById('depth-status').innerHTML = `
        Provided d = <strong>${d.toFixed(1)} mm</strong> &nbsp;&nbsp; | &nbsp;&nbsp; 
        Required d = <strong>${dReq.toFixed(1)} mm</strong><br>
        <span class="badge ${depthSafe ? 'badge-safe' : 'badge-unsafe'}" style="margin-top:8px;">${depthSafe ? '✅ DEPTH IS ADEQUATE' : '❌ INCREASE THICKNESS'}</span>
    `;

    const steelHTML = `
        <div class="result-row"><span>A<sub>st</sub> (short) required</span><span>${AstX.toFixed(1)} mm²/m</span></div>
        <div class="result-row"><span>A<sub>st</sub> (long) required</span><span>${AstY.toFixed(1)} mm²/m</span></div>
        <div class="result-row"><span>Provided reinforcement (short)</span><span>φ ${phi} mm @ ${spacingX} mm c/c</span></div>
        <div class="result-row"><span>Provided reinforcement (long)</span><span>φ ${phi} mm @ ${spacingY} mm c/c</span></div>
        <div style="margin-top:12px;font-size:0.85rem;color:#10b981;">Max spacing limit = min(3d, 300) = ${maxSpacing.toFixed(0)} mm ✅</div>
    `;
    document.getElementById('steel-results').innerHTML = steelHTML;

    document.getElementById('deflection-result').innerHTML = `
        Actual L/d = <strong>${actualLd.toFixed(1)}</strong><br>
        Allowable L/d ≈ <strong>${allowableLd.toFixed(1)}</strong><br>
        <span class="badge ${deflectionSafe ? 'badge-safe' : 'badge-unsafe'}">${deflectionSafe ? '✅ DEFLECTION SAFE' : '❌ DEFLECTION NOT SAFE'}</span>
    `;

    document.getElementById('shear-result').innerHTML = `
        τ<sub>v</sub> = <strong>${tauV.toFixed(3)} N/mm²</strong><br>
        τ<sub>c</sub> (perm) = <strong>${tauC.toFixed(3)} N/mm²</strong><br>
        <span class="badge ${shearSafe ? 'badge-safe' : 'badge-unsafe'}">${shearSafe ? '✅ SHEAR SAFE' : '❌ SHEAR NOT SAFE'}</span>
    `;

    if (window.innerWidth < 1024) output.scrollIntoView({ behavior: 'smooth' });
}

function loadSampleData() {
    document.getElementById('lx').value = '3.5';
    document.getElementById('ly').value = '4.5';
    document.getElementById('fck').value = '25';
    document.getElementById('fy').value = '415';
    document.getElementById('thickness').value = '150';
    document.getElementById('clear-cover').value = '20';
    document.getElementById('bar-dia').value = '8';
    document.getElementById('alpha-x').value = '0.057';
    document.getElementById('alpha-y').value = '0.028';
    document.getElementById('j-factor').value = '0.90';
    document.getElementById('unit-weight').value = '25';
    document.getElementById('ff-load').value = '1';
    document.getElementById('ll-load').value = '3';
    document.getElementById('support-type').value = '2';
    
    setTimeout(() => calculateSlab(), 300);
    alert("✅ Sample data loaded (Lx=3.5 m, Ly=4.5 m, M25, 150 mm slab). Results ready!");
}

function resetForm() {
    if (confirm("Reset all inputs and clear results?")) {
        document.getElementById('output-panel').classList.remove('show');
        const inputs = document.querySelectorAll('#input-panel input, #input-panel select');
        inputs.forEach(el => {
            if (el.id === 'lx') el.value = '3.5';
            else if (el.id === 'ly') el.value = '4.5';
            else if (el.id === 'thickness') el.value = '150';
            else if (el.id === 'clear-cover') el.value = '20';
            else if (el.id === 'bar-dia') el.value = '8';
            else if (el.id === 'fck') el.value = '25';
            else if (el.id === 'fy') el.value = '415';
            else if (el.id === 'alpha-x') el.value = '0.062';
            else if (el.id === 'alpha-y') el.value = '0.035';
            else if (el.id === 'j-factor') el.value = '0.90';
            else if (el.id === 'unit-weight') el.value = '25';
            else if (el.id === 'ff-load') el.value = '1';
            else if (el.id === 'll-load') el.value = '3';
            else el.value = el.defaultValue || '';
        });
    }
}

function copyResults() {
    const outputPanel = document.getElementById('output-panel');
    if (!outputPanel.classList.contains('show')) {
        alert("Calculate first!");
        return;
    }
    const text = `
RCC SLAB DESIGN REPORT – IS 456:2000
====================================
Slab Type     : ${document.getElementById('slab-type-display').innerText}
Effective d   : ${document.getElementById('d-value').innerText}
Factored load : ${document.getElementById('factored-load').innerText}
Mx            : ${document.getElementById('mx-value').innerText}
My            : ${document.getElementById('my-value').innerText}
Depth check   : ${document.getElementById('depth-status').innerText}
Steel (short) : φ 8 mm @ ${document.querySelector('#steel-results .result-row:nth-child(3) span:last-child').innerText}
Steel (long)  : φ 8 mm @ ${document.querySelector('#steel-results .result-row:nth-child(4) span:last-child').innerText}
Deflection    : ${document.getElementById('deflection-result').innerText}
Shear         : ${document.getElementById('shear-result').innerText}
            
Generated by RCC Slab Calculator – Bharati Vidyapeeth College of Engineering, Pune
    `.trim();
    
    navigator.clipboard.writeText(text).then(() => alert("✅ Full design report copied to clipboard!"));
}

function initializeApp() {
    renderSidebar();
    console.log('%c✅ RCC Slab Design Calculator loaded successfully!', 'color:#0066cc;font-size:1.1rem;font-weight:600');
    console.log('Team: Adnan Shaikh (40), Sameer Ahmad Pala (42), Jay Deshmukh (43), Aijaz Ahmad (24)');
    console.log('Guided by Dr. Pradeep B. Kodag | Bharati Vidyapeeth College of Engineering, Pune');
    
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') calculateSlab();
    });
}

window.onload = initializeApp;