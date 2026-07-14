// Información almacenada en el LocalStorage
let cart = [];
try {
    const savedCart = localStorage.getItem('refugio-miau-carrito');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
} catch (e) {
    console.error("Error leyendo del localStorage:", e);
}

// Elementos interactivos (DOM)
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const openCartBtn = document.getElementById('open-cart-btn');
const closeCartBtn = document.getElementById('close-cart-btn');
const clearCartActionBtn = document.getElementById('clear-cart-action');
const checkoutBtn = document.getElementById('checkout-btn');
const cartItemsList = document.getElementById('cart-items-list');
const cartTotalPrice = document.getElementById('cart-total-price');
const cartCounter = document.getElementById('cart-counter');
const miauToast = document.getElementById('miau-toast');
const toastText = document.getElementById('toast-text');

let toastTimeout; 

// Abre el panel lateral del carrito
function openCart() {
    cartSidebar.classList.add('open');
    cartOverlay.classList.add('active');
}

// Cierra el panel lateral del carrito
function closeCart() {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('active');
}

// Notificaciones interactivas (Toasts)
function miauNotify(message) {
    clearTimeout(toastTimeout); 
    
    toastText.textContent = message;
    miauToast.classList.add('show');
    
    // Oculta notificación y guarda el ID del temporizador
    toastTimeout = setTimeout(() => {
        miauToast.classList.remove('show');
    }, 3000);
}

// Simulación suscripción al voluntariado
async function customSubmit() {
    const form = document.querySelector('form');
    const formData = new FormData(form);

    try {
        const response = await fetch(form.action, {
            method: form.method,
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            alert('¡Solicitud enviada con éxito! Miau-chas gracias.');
            form.reset();
        } else {
            alert('Hubo un problema al enviar el formulario.');
        }
    } catch (error) {
        alert('Error de conexión al intentar enviar.');
    }
}

// Guarda de estado del carrito
function saveCartToStorage() {
    try {
        localStorage.setItem('refugio-miau-carrito', JSON.stringify(cart));
    } catch (e) {
        console.error("No se pudo escribir en el localStorage:", e);
    }
    renderCart();
}

// Añade nuevo producto al carrito
function addToCart(id, name, price, img) {
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += 1;
        miauNotify(`Suma otro/a: "${name}"`);
    } else {
        cart.push({
            id: id,
            name: name,
            price: parseFloat(price),
            img: img,
            quantity: 1
        });
        miauNotify(`Añadido: "${name}"`);
    }
    saveCartToStorage();
}

// Elimina producto del carrito de compras
function removeFromCart(id) {
    const item = cart.find(i => i.id === id);
    if (item) {
        miauNotify(`Eliminaste: "${item.name}"`);
        cart = cart.filter(i => i.id !== id);
        saveCartToStorage();
    }
}

// Modifica cantidad de un producto
function changeQuantity(id, action) {
    const item = cart.find(i => i.id === id);
    if (item) {
        if (action === 'increase') {
            item.quantity += 1;
        } else if (action === 'decrease') {
            item.quantity -= 1;
            if (item.quantity <= 0) {
                removeFromCart(id);
                return;
            }
        }
        saveCartToStorage();
    }
}

// Vacía todo el carrito
function clearCart() {
    if (cart.length === 0) return;
    cart = [];
    miauNotify("Se vació tu carrito de ayuda 🐾");
    saveCartToStorage();
}

// Simulación de finalización de compra/donación
function checkoutMiau() {
    if (cart.length === 0) {
        miauNotify("El carrito está vacío.");
        return;
    }
    miauNotify("¡Miau-gracias por tu inmensa ayuda! ❤️🐾");
    cart = [];
    saveCartToStorage();
    setTimeout(() => {
        closeCart();
    }, 1500);
}

// RENDERIZADO EN PANTALLA
function renderCart() {
    const emptyMsg = document.getElementById('cart-empty-message');
    
    // Eliminar elementos viejos de la lista
    const oldItems = cartItemsList.querySelectorAll('.cart-item');
    oldItems.forEach(el => el.remove());

    if (cart.length === 0) {
        if (emptyMsg) emptyMsg.style.display = 'block';
        cartTotalPrice.textContent = "$0";
        cartCounter.textContent = "0";
        return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';

    let totalAcumulado = 0;
    let totalItemsCount = 0;

    cart.forEach(item => {
        const subtotal = item.price * item.quantity;
        totalAcumulado += subtotal;
        totalItemsCount += item.quantity;

        // Crear fila de producto
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.dataset.id = item.id; 
        
        cartItemElement.innerHTML = `
            <img src="${item.img}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">Unitario: $${item.price}</div>
                <div class="cart-item-subtotal">Subtotal: $${subtotal}</div>
            </div>
            <div class="cart-item-actions">
                <button class="delete-item-btn" title="Quitar">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
                <div class="quantity-control">
                    <button class="quantity-btn btn-decrease">-</button>
                    <span class="quantity-val">${item.quantity}</span>
                    <button class="quantity-btn btn-increase">+</button>
                </div>
            </div>
        `;
        cartItemsList.appendChild(cartItemElement);
    });

    // Actualizar valor total y burbuja del carrito
    cartTotalPrice.textContent = `$${totalAcumulado}`;
    cartCounter.textContent = totalItemsCount;
}

// VINCULACIÓN DE EVENTOS (EventListeners)
document.addEventListener('DOMContentLoaded', () => {
    // CONTROL DEL MENÚ (CELULAR/PC)
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (menuToggle && navMenu) {
        // Apertura y cierre menú del botón flotante
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            const icon = menuToggle.querySelector('i');
            if (icon.classList.contains('fa-bars')) {
                icon.className = 'fa-solid fa-xmark';
            } else {
                icon.className = 'fa-solid fa-bars';
            }
        });
        // Cierra el menú al hacer clic en cualquier opción
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                const icon = menuToggle.querySelector('i');
                if (icon) icon.className = 'fa-solid fa-bars';
            });
        });
        // Detector de scroll (PC)
        window.addEventListener('scroll', () => {
            const scrollDistance = window.scrollY;

            // Aparecer/desaparecer botón (PC)
            if (window.innerWidth > 768) {
                if (scrollDistance > 250) {
                    //Al bajar más de 250px, botón flotante activo
                    menuToggle.classList.add('desktop-floating-active');
                } else {
                    // Arriba esconder botón menú
                    menuToggle.classList.remove('desktop-floating-active');
                    navMenu.classList.remove('open');
                    const icon = menuToggle.querySelector('i');
                    if (icon) icon.className = 'fa-solid fa-bars';
                }
            } else {
                menuToggle.classList.remove('desktop-floating-active');
            }
        });
    }
    
    // SCROLL SUAVE
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                
                if (navMenu) navMenu.classList.remove('open');
                const toggleIcon = document.querySelector('#menu-toggle i');
                if (toggleIcon) toggleIcon.className = 'fa-solid fa-bars';

                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - 20;
                const startPosition = window.pageYOffset;
                const distance = targetPosition - startPosition;
                const duration = 600; 
                let start = null;

                function step(timestamp) {
                    if (!start) start = timestamp;
                    const progress = timestamp - start;
                    const progressRatio = Math.min(progress / duration, 1);
                    const ease = progressRatio < 0.5 
                        ? 2 * progressRatio * progressRatio 
                        : -1 + (4 - 2 * progressRatio) * progressRatio;

                    window.scrollTo(0, startPosition + distance * ease);

                    if (progress < duration) {
                        window.requestAnimationFrame(step);
                    }
                }
                window.requestAnimationFrame(step);
            }
        });
    });

    // Carrito
    if (openCartBtn) openCartBtn.addEventListener('click', openCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
    if (clearCartActionBtn) clearCartActionBtn.addEventListener('click', clearCart);
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', checkoutMiau);
    }

    // Configuración tarjetas de michis y donaciones
    const allCards = document.querySelectorAll('.foto-card, .donacion-item');
    allCards.forEach(card => {
        const addBtn = card.querySelector('.add-to-cart-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                const id = card.getAttribute('data-id');
                const name = card.getAttribute('data-name');
                const price = card.getAttribute('data-price');
                const img = card.getAttribute('data-img');
                addToCart(id, name, price, img);
            });
        }
    });

    // DELEGACIÓN DE EVENTOS PARA EL CARRITO
    if (cartItemsList) {
        cartItemsList.addEventListener('click', (e) => {
            const itemRow = e.target.closest('.cart-item');
            if (!itemRow) return;
            
            const id = itemRow.dataset.id;

            if (e.target.closest('.delete-item-btn')) {
                removeFromCart(id);
            }
            else if (e.target.classList.contains('btn-decrease')) {
                changeQuantity(id, 'decrease');
            }
            else if (e.target.classList.contains('btn-increase')) {
                changeQuantity(id, 'increase');
            }
        });
    }

    // Primer renderizado en pantalla de datos previos (LocalStorage)
    renderCart();
});