const products = [
  { id: 'uy-celeste', name: 'Celeste de siempre', detail: 'Uruguay · 90 × 60 cm', price: 1290, category: 'uruguay', tag: 'Más querida', flag: 'uy' },
  { id: 'uy-escudo', name: 'Orientales', detail: 'Uruguay · 120 × 80 cm', price: 1690, category: 'uruguay', tag: '', flag: 'oriental' },
  { id: 'world-sun', name: 'Sol de todos', detail: 'Del mundo · 90 × 60 cm', price: 1490, category: 'mundo', tag: 'Nuevo', flag: 'sun' },
  { id: 'deco-check', name: 'A cuadros', detail: 'Deco & lifestyle · 70 × 50 cm', price: 990, category: 'deco', tag: '', flag: 'check' },
  { id: 'uy-artigas', name: 'Artigas', detail: 'Uruguay · 120 × 80 cm', price: 1890, category: 'uruguay', tag: '', flag: 'artigas' },
  { id: 'world-rainbow', name: 'Todos los colores', detail: 'Del mundo · 90 × 60 cm', price: 1390, category: 'mundo', tag: '', flag: 'rainbow' },
  { id: 'deco-waves', name: 'Olas', detail: 'Deco & lifestyle · 70 × 50 cm', price: 1090, category: 'deco', tag: 'Favorita', flag: 'waves' },
  { id: 'custom', name: 'A tu manera', detail: 'Personalizada · desde 1 unidad', price: 2290, category: 'custom', tag: 'Diseñá la tuya', flag: 'custom' }
];

const formatPrice = value => '$ ' + value.toLocaleString('es-UY');
function flagMarkup(type) {
  const n = (className, count) => `<span class="${className}"></span>`.repeat(count);
  if (type === 'uy') return `<div class="product-flag pflag-uy">${n('stripe',9)}<i>☼</i></div>`;
  if (type === 'oriental') return `<div class="product-flag pflag-oriental"><i>☼</i><b>ORIENTALES</b><small>LIBERTAD O MUERTE</small></div>`;
  if (type === 'sun') return `<div class="product-flag pflag-sun"><i>☼</i><b>DE TODOS</b></div>`;
  if (type === 'check') return `<div class="product-flag pflag-check">${n('cell',6)}</div>`;
  if (type === 'artigas') return `<div class="product-flag pflag-artigas"><i>☼</i><b>ARTIGAS</b><small>1811</small></div>`;
  if (type === 'rainbow') return `<div class="product-flag pflag-rainbow">${n('band',6)}</div>`;
  if (type === 'waves') return `<div class="product-flag pflag-waves"><i></i><i></i><i></i></div>`;
  return `<div class="product-flag pflag-custom"><b>TU</b><i>✳</i><b>IDEA</b></div>`;
}

const grid = document.querySelector('#product-grid');
let activeFilter = 'all';
let showAll = false;
let cart = JSON.parse(localStorage.getItem('bandera-cart') || '{}');

function renderProducts() {
  let list = products.filter(p => activeFilter === 'all' || p.category === activeFilter);
  if (!showAll && activeFilter === 'all') list = list.slice(0, 4);
  grid.innerHTML = list.map(p => `<article class="product-card" data-id="${p.id}"><div class="product-art">${p.tag ? `<span class="product-tag">${p.tag}</span>` : ''}${flagMarkup(p.flag)}<button class="quick-add" aria-label="Agregar ${p.name} a la bolsa">+</button></div><div class="product-info"><div><h3>${p.name}</h3><p>${p.detail}</p></div><span class="product-price">${formatPrice(p.price)}</span></div></article>`).join('');
}

function renderCart() {
  const items = Object.entries(cart).filter(([, quantity]) => quantity > 0);
  const count = items.reduce((sum, [, quantity]) => sum + quantity, 0);
  const total = items.reduce((sum, [id, quantity]) => sum + products.find(p => p.id === id).price * quantity, 0);
  document.querySelector('#cart-count').textContent = count;
  document.querySelector('#drawer-count').textContent = `(${count})`;
  document.querySelector('#cart-subtotal').textContent = formatPrice(total);
  document.querySelector('#cart-empty').style.display = count ? 'none' : 'block';
  document.querySelector('#cart-footer').style.display = count ? 'block' : 'none';
  document.querySelector('#cart-items').innerHTML = items.map(([id, quantity]) => {
    const p = products.find(item => item.id === id);
    return `<article class="cart-line" data-id="${id}"><div class="cart-thumb">${flagMarkup(p.flag)}</div><div><h3>${p.name}</h3><p>${formatPrice(p.price)}</p><div class="qty-controls"><button data-action="minus" aria-label="Quitar uno">−</button><span>${quantity}</span><button data-action="plus" aria-label="Agregar uno">+</button><button class="remove-item" data-action="remove">Eliminar</button></div></div><strong>${formatPrice(p.price * quantity)}</strong></article>`;
  }).join('');
  localStorage.setItem('bandera-cart', JSON.stringify(cart));
}

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  renderCart();
  const toast = document.querySelector('#toast');
  toast.classList.add('show');
  clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => toast.classList.remove('show'), 1900);
}

document.querySelector('.categories').addEventListener('click', event => {
  const button = event.target.closest('.category');
  if (!button) return;
  document.querySelectorAll('.category').forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  activeFilter = button.dataset.filter;
  renderProducts();
});

grid.addEventListener('click', event => {
  const button = event.target.closest('.quick-add');
  if (button) addToCart(button.closest('.product-card').dataset.id);
});

document.querySelector('#cart-items').addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const line = button.closest('.cart-line');
  const id = line.dataset.id;
  if (button.dataset.action === 'plus') cart[id] = (cart[id] || 0) + 1;
  if (button.dataset.action === 'minus') cart[id] = Math.max(0, (cart[id] || 0) - 1);
  if (button.dataset.action === 'remove') delete cart[id];
  renderCart();
});

const drawer = document.querySelector('#cart-drawer');
const overlay = document.querySelector('#cart-overlay');
function toggleCart(open) {
  drawer.classList.toggle('open', open);
  overlay.classList.toggle('open', open);
  drawer.setAttribute('aria-hidden', String(!open));
  document.body.style.overflow = open ? 'hidden' : '';
}
document.querySelector('#cart-open').addEventListener('click', () => toggleCart(true));
document.querySelector('#cart-close').addEventListener('click', () => toggleCart(false));
overlay.addEventListener('click', () => toggleCart(false));
document.querySelector('#continue-shopping').addEventListener('click', () => toggleCart(false));
document.addEventListener('keydown', event => { if (event.key === 'Escape') toggleCart(false); });

document.querySelector('#show-more').addEventListener('click', event => {
  showAll = !showAll;
  renderProducts();
  event.currentTarget.innerHTML = showAll ? 'Ver menos <span>↑</span>' : 'Ver toda la colección <span>↓</span>';
});

document.querySelector('.menu-toggle').addEventListener('click', () => document.querySelector('.main-nav').classList.toggle('open'));
document.querySelectorAll('.main-nav a').forEach(link => link.addEventListener('click', () => document.querySelector('.main-nav').classList.remove('open')));
document.querySelector('#newsletter-form').addEventListener('submit', event => {
  event.preventDefault();
  document.querySelector('#newsletter-message').textContent = '¡Gracias por sumarte! Pronto vas a tener noticias nuestras.';
  event.currentTarget.reset();
});

renderProducts();
renderCart();
