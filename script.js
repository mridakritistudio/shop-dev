/* =====================================================
   HEADER SHRINK ON SCROLL
===================================================== */

window.addEventListener('scroll', () => {
  const header = document.querySelector('header');
  if (!header) return;

  if (window.scrollY > 80) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
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

  toggleThumbnails(category !== 'all');

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
  if (!card) return;

  const name = card.querySelector('.product-label').textContent;
  const link = `${location.origin}${location.pathname}#${id}`;
  const text = `Hi! I'm interested in ordering: ${name}\n\n${link}`;

  try {
    await navigator.clipboard.writeText(text);

    const toast = document.getElementById('copyToast');
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 1000);

    setTimeout(() => {
      window.open('https://ig.me/m/mrida.kriti', '_blank');
    }, 1100);
  } catch (err) {
    window.open('https://ig.me/m/mrida.kriti', '_blank');
  }
}

async function orderOnInstagramOld(id) {
  const card = document.getElementById(id);
  if (!card) return;

  const button = card.querySelector('.order-btn');
  const name = card.querySelector('.product-label').textContent;
  const link = `${location.origin}${location.pathname}#${id}`;
  const text = `Hi! I'm interested in ordering: ${name}\n\n${link}`;

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const instagramWeb = 'https://ig.me/m/mrida.kriti';
  const instagramApp = 'instagram://direct/new?username=mrida.kriti';

  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {}

  // Show toast immediately
  const toast = document.getElementById('copyToast');
  const rect = button.getBoundingClientRect();

  toast.style.left = `${rect.left + rect.width / 2}px`;
  toast.style.top = `${rect.top + window.scrollY - 12}px`;
  toast.style.transform = 'translate(-50%, -100%)';
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 2000);

  // IMPORTANT: open Instagram immediately (no delay)
  if (isMobile) {
    window.location.href = instagramApp;

    // fallback only if app is not installed
    setTimeout(() => {
      window.location.href = instagramWeb;
    }, 600);
  } else {
    window.open(instagramWeb, '_blank');
  }
}