   // --- DATA ---
   const products = [
    { id: 1, name: "Paracetamol 500mg", type: "Tablets", price: 25, desc: "Effective for fever reduction.", usage: "1 tablet after food", image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80", rx: false },
    { id: 2, name: "Amoxicillin 250mg", type: "Tablets", price: 120, desc: "Antibiotic for bacterial infections.", usage: "3 times a day", image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=600&q=80", rx: true },
    { id: 3, name: "Herbal Cough Syrup", type: "Syrups", price: 85, desc: "Natural relief from cough.", usage: "10ml before sleep", image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=600&q=80", rx: false },
    { id: 4, name: "Digital Thermometer", type: "Devices", price: 350, desc: "Fast and accurate temperature.", usage: "Oral/Underarm", image: "https://images.unsplash.com/photo-1583912267550-d974311a7939?auto=format&fit=crop&w=600&q=80", rx: false },
    { id: 5, name: "Multivitamin Complex", type: "Supplements", price: 450, desc: "Daily immunity booster.", usage: "1 tablet daily", image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80", rx: false },
    { id: 6, name: "BP Monitor", type: "Devices", price: 1200, desc: "Automatic blood pressure monitor.", usage: "Wrap around arm", image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=600&q=80", rx: false },
];

let cart = [];
let currentUser = null;
let isLoginMode = true;
let currentCategory = 'all';

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    loadUser(); // Check if user is logged in from previous session
    renderProducts(products);
    setupSearch();
});

// ================= AUTH SYSTEM =================

function loadUser() {
    const stored = localStorage.getItem('medicare_user');
    if (stored) {
        currentUser = JSON.parse(stored);
    }
    renderAuth();
}

function renderAuth() {
    const container = document.getElementById('authSection');
    
    if (currentUser) {
        // USER IS LOGGED IN: Show Name and Logout
        const initial = currentUser.name.charAt(0).toUpperCase();
        container.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; background: #f1f8ff; padding: 5px 15px; border-radius: 20px; border: 1px solid #d0e7ff;">
                <div style="width: 30px; height: 30px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                    ${initial}
                </div>
                <div class="user-info-display">
                    <span class="user-name">${currentUser.name}</span>
                    <span class="user-status">Online</span>
                </div>
                <button class="btn btn-outline btn-sm" onclick="logout()">Logout</button>
            </div>
        `;
    } else {
        // USER IS LOGGED OUT: Show Login Button
        container.innerHTML = `<button class="btn btn-primary" onclick="openModal('authModal')">Login / Register</button>`;
    }
}

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    const title = document.getElementById('authTitle');
    const btn = document.getElementById('authSubmitBtn');
    const nameGroup = document.getElementById('nameGroup');
    const toggleText = document.getElementById('authToggleText');

    if (isLoginMode) {
        title.innerText = 'Login';
        btn.innerText = 'Login';
        nameGroup.style.display = 'none';
        toggleText.innerText = "Don't have an account?";
    } else {
        title.innerText = 'Register';
        btn.innerText = 'Register';
        nameGroup.style.display = 'block';
        toggleText.innerText = "Already have an account?";
    }
}

function handleAuth(e) {
    e.preventDefault();
    const email = document.getElementById('authEmail').value;
    
    if (isLoginMode) {
        // LOGIN LOGIC
        // In a real app, you would verify password with a backend here.
        // For this demo, we just create a user session from the email.
        const name = email.split('@')[0]; 
        currentUser = { name: name.charAt(0).toUpperCase() + name.slice(1), email: email };
        localStorage.setItem('medicare_user', JSON.stringify(currentUser));
        
        showToast("Login Successful!", "success");
        closeModal('authModal');
    } else {
        // REGISTER LOGIC
        const name = document.getElementById('authName').value;
        if(!name) { showToast("Please enter your name", "error"); return; }
        
        currentUser = { name: name, email: email };
        localStorage.setItem('medicare_user', JSON.stringify(currentUser));
        
        showToast("Registration Successful!", "success");
        closeModal('authModal');
    }
    renderAuth();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('medicare_user');
    renderAuth();
    showToast("Logged out successfully", "info");
    // Optional: clear cart on logout
    // cart = []; updateCartUI();
}

// ================= PRODUCT LOGIC =================

function renderProducts(list) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';
    if(list.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">No products found.</p>';
        return;
    }
    list.forEach(p => {
        const rxBadge = p.rx ? `<div class="rx-badge">Rx Required</div>` : '';
        const card = `
            <div class="product-card">
                <div class="card-img">
                    ${rxBadge}
                    <img src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
                </div>
                <div class="card-body">
                    <div style="text-transform:uppercase; font-size:0.75rem; color:var(--text-light); margin-bottom:5px;">${p.type}</div>
                    <div class="product-name">${p.name}</div>
                    <div class="product-meta">${p.desc}</div>
                    <div class="usage-info"><strong>Usage:</strong> ${p.usage}</div>
                    <div class="product-price">₹${p.price}</div>
                    <button class="add-btn" onclick="addToCart(${p.id})">Add to Cart</button>
                </div>
            </div>
        `;
        grid.innerHTML += card;
    });
}

function filterCategory(cat, btn) {
    document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = cat;
    document.getElementById('sectionTitle').innerText = cat === 'all' ? 'Featured Products' : cat;
    if (cat === 'all') {
        renderProducts(products);
    } else {
        renderProducts(products.filter(p => p.type === cat));
    }
}

function setupSearch() {
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        renderProducts(products.filter(p => p.name.toLowerCase().includes(term) || p.type.toLowerCase().includes(term)));
    });
}

// ================= CART LOGIC =================

function addToCart(id) {
    const product = products.find(p => p.id === id);
    const existing = cart.find(item => item.id === id);
    if (existing) existing.qty++;
    else cart.push({ ...product, qty: 1 });
    
    updateCartUI();
    showToast(`${product.name} added to cart`, "success");
}

function updateCartUI() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    const badge = document.getElementById('cartCount');
    badge.innerText = count;
    badge.classList.toggle('hidden', count === 0);

    const container = document.getElementById('cartItems');
    let total = 0;

    if (cart.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#999; padding: 2rem;">Your cart is empty.</p>';
    } else {
        container.innerHTML = cart.map((item, idx) => {
            total += item.price * item.qty;
            return `
                <div class="cart-item">
                    <div style="flex: 1;">
                        <strong>${item.name}</strong><br>
                        <small style="color:#666;">₹${item.price} x ${item.qty}</small>
                    </div>
                    <div class="cart-controls">
                        <button onclick="changeQty(${idx}, -1)">-</button>
                        <span style="margin: 0 10px; font-weight:bold;">${item.qty}</span>
                        <button onclick="changeQty(${idx}, 1)">+</button>
                    </div>
                </div>
            `;
        }).join('');
    }
    document.getElementById('cartTotal').innerText = `₹${total.toFixed(2)}`;
}

function changeQty(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    updateCartUI();
}

function checkout() {
    if (!currentUser) {
        closeModal('cartModal');
        openModal('authModal');
        showToast("Please login to checkout", "error");
        return;
    }
    if (cart.length === 0) {
        showToast("Cart is empty", "error");
        return;
    }
    closeModal('cartModal');
    showToast(`Order Placed Successfully, ${currentUser.name}! 🎉`, "success");
    cart = [];
    updateCartUI();
}

// ================= UTILS =================

function submitPrescription() {
    const fileInput = document.getElementById('prescriptionFile');
    if(fileInput.files.length === 0) {
        showToast("Please select a file first", "error");
        return;
    }
    closeModal('prescriptionModal');
    showToast("Prescription uploaded for review", "success");
}

function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    let icon = 'ℹ️';
    if (type === 'error') icon = '⚠️';
    if (type === 'success') icon = '✅';
    toast.style.borderLeft = `5px solid ${type === 'error' ? 'red' : type === 'success' ? '#20c997' : '#007bff'}`;
    toast.innerHTML = `<span style="font-size:1.2rem;">${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) event.target.style.display = "none";
}