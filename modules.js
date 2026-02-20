// Modules page functionality

// Check if user is logged in
const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
    window.location.href = 'login.html';
}

// Module types data
const moduleTypes = [
    {
        id: 1,
        typeName: 'Yol Kənarı Modulu',
        description: 'Avtomobil səs-küyündən enerji istehsal edir  (Cihaz, dirəyə montaj və baza bulud monitorinqi daxildir)',
        maxPower: 50,
        optimalSound: '70-90 dB',
        price: 2500
    },
    {
        id: 2,
        typeName: 'Sənaye Modulu',
        description: 'Zavod və fabrik səs-küyü üçün (Ağır sənaye şəraitinə davamlı korpus və 10 illik texniki servis xidməti daxildir.) "Özünü ödəmə müddəti: 2 il',
        maxPower: 150,
        optimalSound: '85-110 dB',
        price: 5600
    },
    {
        id: 3,
        typeName: 'İctimai Yer Modulu',
        description: 'Konsert, stadion və s. üçün (Daha yüksək həssaslıqlı sensorlar və rütubətə qarşı xüsusi müdafiə qatı daxildir)',
        maxPower: 100,
        optimalSound: '80-105 dB',
        price: 4500
    },
    {
        id: 4,
        typeName: 'Metro/Tunel Modulu',
        description: 'Nəqliyyat tunellərində (Rütubət və toza qarşı cihazın korpusunun xüsusi olaraq izolyasiya olunması daxildir)',
        maxPower: 75,
        optimalSound: '75-95 dB',
        price: 5500
    }
];

let selectedModule = null;

// Display module types
function displayModuleTypes() {
    const grid = document.getElementById('moduleTypesGrid');
    
    const html = moduleTypes.map(type => `
        <div class="module-type-card">
            <div class="module-type-header">
                <h2>${type.typeName}</h2>
                <span class="price">${type.price} AZN</span>
            </div>
            
            <p class="description">${type.description}</p>
            
            <div class="specs">
                <div class="spec">
                    <span class="spec-label">Maksimum Güc:</span>
                    <span class="spec-value">${type.maxPower} mW</span>
                </div>
                <div class="spec">
                    <span class="spec-label">Optimal Səs:</span>
                    <span class="spec-value">${type.optimalSound}</span>
                </div>
            </div>

            <button class="btn-select" onclick="selectModule(${type.id})">
                Bu Modulu Seç
            </button>
        </div>
    `).join('');
    
    grid.innerHTML = html;
}

// Select module
function selectModule(typeId) {
    selectedModule = moduleTypes.find(t => t.id === typeId);
    document.getElementById('selectedModuleType').textContent = selectedModule.typeName;
    document.getElementById('addModuleModal').style.display = 'flex';
}

// Close modal
function closeModal() {
    document.getElementById('addModuleModal').style.display = 'none';
    selectedModule = null;
}

// Close modal when clicking outside
document.getElementById('addModuleModal')?.addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// Add module form
function submitOrder() {
    if (!selectedModule) return;

    const fullName = document.getElementById('fullName').value.trim();
    const finCode = document.getElementById('finCode').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const location = document.getElementById('location').value.trim();
    const information = document.getElementById('information').value.trim();
    const cardNum = document.getElementById('cardNumber').value.trim();
    const expiry = document.getElementById('cardExpiry').value.trim();
    const cvv = document.getElementById('cardCvv').value.trim();
    const qty = selectedModule._qty || 1;

    if (!fullName) { alert('Zəhmət olmasa ad soyad daxil edin'); return; }
    if (!finCode) { alert('Zəhmət olmasa FIN kod daxil edin'); return; }
    if (!phone) { alert('Zəhmət olmasa telefon nömrəsi daxil edin'); return; }
    if (!location) { alert('Zəhmət olmasa ünvan daxil edin'); return; }
    if (!information) { alert('Zəhmət olmasa quraşdırma yerini daxil edin'); return; }
    if (!cardNum) { alert('Zəhmət olmasa kart nömrəsini daxil edin'); return; }
    if (!expiry) { alert('Zəhmət olmasa son istifadə tarixini daxil edin'); return; }
    if (!cvv) { alert('Zəhmət olmasa CVV daxil edin'); return; }

    // Endirim hesabla
    let discount = 0;
    if (qty >= 10) discount = 0.20;
    else if (qty >= 5) discount = 0.10;
    else if (qty >= 3) discount = 0.05;
    const totalPrice = selectedModule.price * qty * (1 - discount);

    // Sifarişi saxla
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push({
        id: Date.now(),
        userId: user.id,
        moduleName: selectedModule.typeName,
        qty: qty,
        price: totalPrice,
        fullName: fullName,
        phone: phone,
        location: location,
        information: information,
        date: new Date().toLocaleDateString('az-AZ'),
        status: 'Gözləmədə'
    });
    localStorage.setItem('orders', JSON.stringify(orders));

    alert(`✅ Sifarişiniz qəbul edildi!\n\n👤 ${fullName}\n📦 ${qty} ədəd ${selectedModule.typeName}\n💰 ${totalPrice.toLocaleString()} AZN\n📍 ${location}\n📞 ${phone}`);

    closeModal();
    window.location.href = 'dashboard.html';
}
// Initialize
displayModuleTypes();
function setQty(n) {
    document.getElementById('moduleQty').value = n;
}

function selectPayment(type) {
    document.getElementById('cardDetails').style.display = type === 'card' ? 'block' : 'none';
    // Aktiv görünüş
    document.querySelectorAll('[name="payment"]').forEach(r => r.checked = r.value === type);
}

function formatCard(input) {
    let v = input.value.replace(/\D/g, '').substring(0, 16);
    input.value = v.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(input) {
    let v = input.value.replace(/\D/g, '').substring(0, 4);
    if (v.length >= 2) v = v.substring(0, 2) + '/' + v.substring(2);
    input.value = v;
}
console.log('Form tapıldı:', document.getElementById('addModuleForm'));
function calcCustomTotal() {
    const qty = parseInt(document.getElementById('customQtyInput').value) || 0;
    const totalBox = document.getElementById('customTotalBox');

    if (qty < 1) { totalBox.style.display = 'none'; return; }

    const pricePerUnit = 35;
    const total = pricePerUnit * qty;
    document.getElementById('customTotalValue').textContent = total.toLocaleString() + ' AZN';
    totalBox.style.display = 'block';
}

// select dəyişəndə də hesabla
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('customModuleType').addEventListener('change', calcCustomTotal);
});

function openCustomOrder() {
    const qty = parseInt(document.getElementById('customQtyInput').value) || 0;
    if (qty < 1) { alert('Zəhmət olmasa ədəd daxil edin'); return; }

    selectedModule = {
        id: 0,
        typeName: 'Fərdi Modul',
        price: 35,
        _qty: qty
    };
    document.getElementById('selectedModuleType').textContent = 'Fərdi Modul x' + qty + ' — ' + (35 * qty) + ' AZN';
    document.getElementById('addModuleModal').style.display = 'flex';
}
