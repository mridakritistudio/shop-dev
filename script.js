/* =====================================================
   HEADER SHRINK ON SCROLL
===================================================== */

let isScrolled = false;

window.addEventListener('scroll', () => {
  const header = document.querySelector('header');
  if (!header) return;

  const y = window.scrollY;

  if (!isScrolled && y > 100) {
    header.classList.add('scrolled');
    isScrolled = true;
  } 
  else if (isScrolled && y < 40) {
    header.classList.remove('scrolled');
    isScrolled = false;
  }
});

/* =====================================================
   LOAD PRODUCTS
===================================================== */

async function loadProducts() {
  const container = document.getElementById('products-container');
  if (!container) return;

  try {
    const response = await fetch('products.json');
    const data = await response.json();

    container.innerHTML = '';

    data.products.forEach((product, index) => {
      const sizeClass =
        product.sizeCategory.toLowerCase() === 's'
          ? 'small'
          : product.sizeCategory.toLowerCase() === 'm'
          ? 'medium'
          : 'large';

      const description =
        product.designType.toLowerCase() === 'circle' || product.designType.toLowerCase() === 'square'
          ? `${product.sizeCategory}, ${product.designType} ${product.dimensions.split('×')[0].trim()}`
          : `${product.sizeCategory}, ${product.designType}, ${product.dimensions}`;

      const images = product.images?.length ? product.images : [product.image];

      const card = document.createElement('div');
      card.className = `product-card ${sizeClass}`;
      card.id = product.id;
      card.style.animationDelay = `${(index + 1) * 0.1}s`;
      card.dataset.images = JSON.stringify(images);

      card.innerHTML = `
        <div class="product-image-container">
          <img src="${images[0]}"
               class="product-main-image"
               alt="${product.label}"
               onclick="openProductModal('${product.id}', 0)">
          ${
            images.length > 1
              ? `<div class="product-thumbnails">
                  ${images
                    .map(
                      (img, i) =>
                        `<img src="${img}"
                              class="product-thumbnail ${i === 0 ? 'active' : ''}"
                              onclick="openProductModal('${product.id}', ${i})">`
                    )
                    .join('')}
                </div>`
              : ''
          }
        </div>

        <div class="product-label">${product.label}</div>
        <div class="product-description">${description}</div>
        <button class="order-btn" onclick="orderOnInstagram('${product.id}')">
          Order via Instagram
        </button>
      `;

      container.appendChild(card);
    });
  } catch (err) {
    container.innerHTML =
      '<p style="text-align:center;color:var(--mud-brown)">Error loading products</p>';
  }
}

/* =====================================================
   INIT
===================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  await loadProducts();
  filterCategory('all');
  setupModalKeyboardNavigation();
});

/* =====================================================
   FILTERING
===================================================== */

function filterCategory(category) {
  const cards = document.querySelectorAll('.product-card');
  const buttons = document.querySelectorAll('.category-filter button');
  const container = document.getElementById('products-container');

  buttons.forEach(btn => {
    btn.classList.toggle(
      'active',
      btn.textContent.trim().toLowerCase() === category
    );
  });

  // toggleThumbnails(category !== 'all');

  let visible = 0;

  cards.forEach(card => {
    const show = category === 'all' || card.classList.contains(category);
    card.style.display = show ? 'block' : 'none';
    if (show) visible++;
  });

  container.classList.toggle('single-product', visible === 1);
}

function toggleThumbnails(show) {
  document.querySelectorAll('.product-thumbnails').forEach(t => {
    t.style.display = show ? 'flex' : 'none';
  });
}

/* =====================================================
   MODAL
===================================================== */

let currentImages = [];
let currentIndex = 0;

function openProductModal(id, index = 0) {
  const card = document.getElementById(id);
  if (!card) return;

  currentImages = JSON.parse(card.dataset.images || '[]');
  currentIndex = index;

  const modal = document.getElementById('imageModal');
  const img = document.getElementById('modalImage');

  img.src = currentImages[currentIndex];
  updateModalNavigation();
  modal.style.display = 'flex';
}

function closeModal() {
  document.getElementById('imageModal').style.display = 'none';
}

function previousImage() {
  currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
  updateModalImage();
}

function nextImage() {
  currentIndex = (currentIndex + 1) % currentImages.length;
  updateModalImage();
}

function updateModalImage() {
  document.getElementById('modalImage').src = currentImages[currentIndex];
  updateModalNavigation();
}

function updateModalNavigation() {
  const show = currentImages.length > 1;
  document.getElementById('modalPrev').style.display = show ? 'flex' : 'none';
  document.getElementById('modalNext').style.display = show ? 'flex' : 'none';
  const counter = document.getElementById('modalImageCounter');
  counter.style.display = show ? 'block' : 'none';
  counter.textContent = `${currentIndex + 1} / ${currentImages.length}`;
}

function setupModalKeyboardNavigation() {
  document.addEventListener('keydown', e => {
    const modalOpen =
      document.getElementById('imageModal').style.display === 'flex';

    if (!modalOpen) return;

    if (e.key === 'ArrowLeft') previousImage();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'Escape') closeModal();
  });
}

/* =====================================================
   INSTAGRAM ORDER
===================================================== */

async function orderOnInstagram(id) {
  const card = document.getElementById(id);
  const name = card.querySelector('.product-label').textContent;
  const link = `${location.origin}${location.pathname}#${id}`;
  const text = `Hi! I'm interested in ordering: ${name}\n\n${link}`;

  await navigator.clipboard.writeText(text);

  setTimeout(() => {
    window.open('https://ig.me/m/mrida.kriti', '_blank');
  }, 800);
}