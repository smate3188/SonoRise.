// Check if user is logged in
const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
    window.location.href = 'login.html';
}

// Display user name
document.getElementById('userName').textContent = user.fullName;

// Başlanğıc dəyərləri
let currentEnergy = 12.450;
let currentCO2 = 5.230;

function getUserModules() {
    const all = JSON.parse(localStorage.getItem('modules') || '[]');
    return all.filter(m => m.userId === user.id);
}

function updateSound() {
    const random = (Math.random() * 2.6) - 1.3;
    document.getElementById('avgSound').textContent = (85 + random).toFixed(1) + ' dB';
}

function updateEnergy() {
    currentEnergy += 0.001;
    currentCO2 += 0.001;
    document.getElementById('totalEnergy').textContent = currentEnergy.toFixed(3) + ' kWh';
    document.getElementById('co2Reduced').textContent = currentCO2.toFixed(3) + ' kg';
}

function updateTemp() {
    const el = document.getElementById('tempValue');
    if (el) el.textContent = (24 + (Math.random() * 1.4 - 0.7)).toFixed(1) + '°C';
}

function drawChart(canvasId) {
    const now = new Date();
    const currentHour = now.getHours();
    const seed = canvasId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    function seededRandom(i) {
        return Math.abs(Math.sin(seed * 127 + i * 311 + seed * i * 0.7) % 1);
    }
    const noiseProfil = [0.08,0.06,0.05,0.05,0.07,0.18,0.38,0.62,0.78,0.88,0.92,0.85,0.75,0.70,0.65,0.60,0.55,0.62,0.50,0.40,0.30,0.22,0.15,0.10];
    const labels = [], realData = [], forecastData = [];
    let cumulative = 0;
    for (let h = 0; h < 24; h++) {
        labels.push(h.toString().padStart(2, '0') + ':00');
        const baseNoise = noiseProfil[h];
        const variation = (seededRandom(h) * 0.16) - 0.08;
        const hourlyEnergy = Math.max(0.001, (baseNoise + variation) * 0.014);
        cumulative += hourlyEnergy;
        if (h <= currentHour) {
            realData.push(parseFloat(cumulative.toFixed(4)));
            forecastData.push(h === currentHour ? parseFloat(cumulative.toFixed(4)) : null);
        } else {
            realData.push(null);
            forecastData.push(parseFloat(cumulative.toFixed(4)));
        }
    }
    const isMain = canvasId === 'chart-sono01';
    const mainColor = isMain ? '#3b82f6' : '#22c55e';
    const mainBg = isMain ? 'rgba(59,130,246,0.1)' : 'rgba(34,197,94,0.08)';
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    if (ctx._chart) ctx._chart.destroy();
    ctx._chart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels,
            datasets: [
                { label: t('dash_daily_chart'), data: realData, borderColor: mainColor, backgroundColor: mainBg, borderWidth: 2, pointRadius: 2, pointBackgroundColor: mainColor, fill: true, tension: 0.4, spanGaps: false },
                { label: 'Forecast', data: forecastData, borderColor: mainColor, backgroundColor: 'transparent', borderWidth: 2, borderDash: [5,5], pointRadius: 0, fill: false, tension: 0.4, spanGaps: true }
            ]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: '#9ca3af', font: { size: 9 } }, grid: { color: '#2a2a2a' } },
                y: { ticks: { color: '#9ca3af', font: { size: 9 } }, grid: { color: '#2a2a2a' } }
            }
        }
    });
}

function moduleCardHTML(id, name, location, power, date, deviceId, chartId) {
    return `
        <div class="module-card">
            <div class="module-header">
                <h3>${name}</h3>
                <span class="status" style="background:#14532d; color:#86efac;">● ${t('dash_online')}</span>
            </div>
            <div class="module-info">
                <p><strong>📍</strong> ${location}</p>
                <p><strong>⚡ ${t('dash_temp').replace('Temperatur','Güc')}:</strong> ${power} W</p>
                <p><strong>🆔 ID:</strong> ${deviceId ? deviceId : 'SNR-2026-0001'}</p>
                <div style="margin-top:16px; padding:12px; background:#0f0f0f; border-radius:8px; border:1px solid #2a2a2a;">
                    <p style="color:#9ca3af; font-size:0.8rem; margin-bottom:8px; font-weight:600; letter-spacing:1px;">${t('dash_system_health')}</p>
                    <div style="display:flex; flex-direction:column; gap:6px;">
                        <div style="display:flex; justify-content:space-between;">
                            <span style="color:#9ca3af; font-size:0.85rem;">${t('dash_status')}</span>
                            <span style="color:#22c55e; font-size:0.85rem; font-weight:600;">${t('dash_stabil')}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between;">
                            <span style="color:#9ca3af; font-size:0.85rem;">${t('dash_temp')}</span>
                            <span style="color:#fff; font-size:0.85rem; font-weight:600;" ${chartId === 'chart-sono01' ? 'id="tempValue"' : ''}>24°C</span>
                        </div>
                        <div style="display:flex; justify-content:space-between;">
                            <span style="color:#9ca3af; font-size:0.85rem;">${t('dash_connection')}</span>
                            <span style="color:#3b82f6; font-size:0.85rem; font-weight:600;">${t('dash_wifi')}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div style="margin-top:16px;">
                <h3 style="color:#fff; margin-bottom:12px; font-size:0.95rem;">${t('dash_daily_chart')}</h3>
                <canvas id="${chartId}" height="120"></canvas>
            </div>
            ${id ? `<button class="btn-delete" style="margin-top:16px;" onclick="deleteModule(${id})">${t('dash_delete')}</button>` : `<button class="btn-delete" style="margin-top:16px;" onclick="deleteSono01()">${t('dash_delete')}</button>`}
        </div>
    `;
}

function displayModules() {
    const container = document.getElementById('modulesContainer');
    const extraModules = getUserModules();
    const extraCards = extraModules.map(m =>
        moduleCardHTML(m.id, m.typeName, m.location, m.maxPower,
            new Date(m.createdAt).toLocaleDateString(), m.deviceId, 'chart-' + m.id)
    ).join('');
    container.innerHTML = `
        <div class="modules-grid">
            ${moduleCardHTML(null, 'Active Module: Sono-01', 'Nizami küçəsi', 50, '01.01.2026', null, 'chart-sono01')}
            ${extraCards}
        </div>
    `;
    drawChart('chart-sono01');
    extraModules.forEach(m => drawChart('chart-' + m.id));
    document.getElementById('totalModules').textContent = extraModules.length + 1;
}

function deleteModule(moduleId) {
    if (confirm(t('dash_delete') + '?')) {
        const modules = JSON.parse(localStorage.getItem('modules') || '[]');
        localStorage.setItem('modules', JSON.stringify(modules.filter(m => m.id !== moduleId)));
        displayModules();
    }
}

function openAddModal() {
    document.getElementById('addModuleModal').style.display = 'flex';
}

function closeAddModal() {
    document.getElementById('addModuleModal').style.display = 'none';
    document.getElementById('deviceIdInput').value = '';
    document.getElementById('deviceLocationInput').value = '';
}

function connectDevice() {
    const id = document.getElementById('deviceIdInput').value.trim();
    const location = document.getElementById('deviceLocationInput').value.trim();
    if (!id) { alert(t('dash_device_id')); return; }
    if (!id.startsWith('SNR-')) { alert('Wrong ID format: SNR-2024-XXXX'); return; }
    if (!location) { alert(t('dash_device_loc')); return; }
    const modules = JSON.parse(localStorage.getItem('modules') || '[]');
    modules.push({ id: Date.now(), userId: user.id, typeName: 'Active Module: ' + id, location, maxPower: 50, deviceId: id, createdAt: new Date().toISOString() });
    localStorage.setItem('modules', JSON.stringify(modules));
    alert('✅ ' + id);
    closeAddModal();
    displayModules();
}

document.getElementById('addModuleModal').addEventListener('click', function(e) {
    if (e.target === this) closeAddModal();
});

function toggleNotif() {
    const d = document.getElementById('notifDropdown');
    d.style.display = d.style.display === 'none' ? 'block' : 'none';
}

document.addEventListener('click', function(e) {
    if (!e.target.closest('.notif-wrapper')) {
        const d = document.getElementById('notifDropdown');
        if (d) d.style.display = 'none';
    }
});

function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

function deleteSono01() {
    if (confirm(t('dash_delete') + '?')) {
        displayModules();
        document.getElementById('totalModules').textContent = getUserModules().length;
    }
}

function showOrders() {
    const section = document.getElementById('ordersSection');
    const container = document.getElementById('ordersContainer');
    section.style.display = 'block';
    section.scrollIntoView({ behavior: 'smooth' });
    const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const userOrders = allOrders.filter(o => o.userId === user.id);
    if (userOrders.length === 0) {
        container.innerHTML = `<div class="empty-state"><p>${t('dash_no_orders')}</p></div>`;
        return;
    }
    container.innerHTML = `
        <div class="modules-grid">
            ${userOrders.map(order => `
                <div class="module-card">
                    <div class="module-header">
                        <h3>${order.moduleName}</h3>
                        <span style="background:#1e3a5f; color:#60a5fa; padding:4px 12px; border-radius:12px; font-size:0.85rem; font-weight:600;">⏳ ${t('dash_order_status')}</span>
                    </div>
                    <div class="module-info">
                        <p><strong>👤</strong> ${order.fullName}</p>
                        <p><strong>📞</strong> ${order.phone}</p>
                        <p><strong>📍</strong> ${order.location}</p>
                        <p><strong>📌</strong> ${order.information}</p>
                        <p><strong>💰</strong> ${order.price} AZN</p>
                        <p><strong>📅</strong> ${order.date}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

updateSound();
updateEnergy();
displayModules();
setInterval(updateSound, 1500);
setInterval(updateEnergy, 12000);
setInterval(updateTemp, 5000);
