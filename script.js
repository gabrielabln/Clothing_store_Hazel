// Funcția pentru a șterge un produs
async function deleteProduct(productId) {
    console.log(`Ștergere produs cu ID: ${productId}`);
    try {
        const response = await fetch(`/products/${productId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            fetchProducts(); // Reîncarcă lista de produse
        } else {
            console.error('Eroare la ștergerea produsului:', await response.text());
        }
    } catch (error) {
        console.error('Eroare la comunicarea cu serverul:', error);
    }
}

// Funcția pentru a edita un produs
function editProduct(id, currentName, currentPrice) {
    console.log('Butonul Editează a fost apăsat!');
    console.log(`ID: ${id}, Nume: ${currentName}, Preț: ${currentPrice}`);

    // Afișează formularul de editare
    const editForm = document.getElementById('edit-product-container');
    editForm.style.display = 'block';

    // Completează formularul cu valorile produsului curent
    document.getElementById('edit-product-id').value = id;
    document.getElementById('edit-product-name').value = currentName;
    document.getElementById('edit-product-price').value = currentPrice;
}

// Funcția pentru a obține produsele de la backend
async function fetchProducts() {
    try {
        const response = await fetch('/products'); // Cerere GET către backend
        const products = await response.json(); // Transformă răspunsul în JSON

        const productsContainer = document.getElementById('products'); // Găsește containerul pentru produse
        productsContainer.innerHTML = products.map(product => `
            <div class="product">
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>Preț: ${product.price} RON</p>
                <button class="delete-button" data-id="${product.id}">Șterge</button>
                <button class="edit-button" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">Editează</button>
            </div>
        `).join(''); // Afișează produsele în HTML
    } catch (error) {
        console.error('Eroare la obținerea produselor:', error);
    }

    // Adaugă Event Listener pentru butoanele de Ștergere și Editare
    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            deleteProduct(productId);
        });
    });

    document.querySelectorAll('.edit-button').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const productName = this.getAttribute('data-name');
            const productPrice = this.getAttribute('data-price');
            editProduct(productId, productName, productPrice);
        });
    });
}

// Funcția pentru a trimite un produs nou către backend
async function addProduct(event) {
    event.preventDefault();
    const name = document.getElementById('product-name').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const imageInput = document.getElementById('imagine').files[0];

    console.log('Date formular:', { name, price, imageInput });

    if (!imageInput) {
        console.error('Nu a fost selectată nicio imagine!');
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        const imageBase64 = reader.result;
        sendProductToBackend(name, price, imageBase64);
    };
    reader.readAsDataURL(imageInput);
}

// Funcția pentru a trimite cererea POST către backend
async function sendProductToBackend(name, price, image) {
    try {
        const response = await fetch('/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, price, image })
        });

        if (response.ok) {
            fetchProducts(); // Reîncarcă lista de produse
            document.getElementById('add-product-form').reset(); // Resetează formularul
        } else {
            console.error('Eroare la adăugarea produsului:', await response.text());
        }
    } catch (error) {
        console.error('Eroare la comunicarea cu serverul:', error);
    }
}

// Funcția pentru a salva editarea unui produs
async function submitEdit(event) {
    event.preventDefault();

    const id = document.getElementById('edit-product-id').value;
    const name = document.getElementById('edit-product-name').value;
    const price = parseFloat(document.getElementById('edit-product-price').value);

    console.log('Se trimite cererea PUT către server:');
    console.log(`URL: /products/${id}`);
    console.log(`Corpul cererii:`, { name, price });

    try {
        const response = await fetch(`/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, price }),
        });

        if (response.ok) {
            console.log('Produs actualizat cu succes!');
            fetchProducts(); // Reîncarcă lista de produse
            document.getElementById('edit-product-form').reset(); // Resetează formularul
            document.getElementById('edit-product-container').style.display = 'none'; // Ascunde formularul
        } else {
            console.error('Eroare la actualizarea produsului:', await response.text());
        }
    } catch (error) {
        console.error('Eroare la comunicarea cu serverul:', error);
    }
}

// Adaugă evenimentele necesare
window.onload = () => {
    fetchProducts(); // Încarcă produsele la pornirea paginii
    document.getElementById('add-product-form').onsubmit = addProduct;
    document.getElementById('edit-product-form').onsubmit = submitEdit;
};
// Funcția pentru a filtra produsele
function filterProducts(event) {
    event.preventDefault();

    const filterName = document.getElementById('filter-name').value.toLowerCase();
    const filterPrice = parseFloat(document.getElementById('filter-price').value);

    // Obține toate produsele
    const productElements = document.querySelectorAll('.product');

    productElements.forEach(productElement => {
        const name = productElement.querySelector('h3').textContent.toLowerCase();
        const priceText = productElement.querySelector('p').textContent;
        const price = parseFloat(priceText.replace('Preț: ', '').replace(' RON', ''));

        // Verifică dacă produsul se potrivește cu filtrele
        const matchesName = filterName === '' || name.includes(filterName);
        const matchesPrice = isNaN(filterPrice) || price <= filterPrice;

        // Ascunde sau arată produsul în funcție de potrivirea cu filtrele
        if (matchesName && matchesPrice) {
            productElement.style.display = 'block';
        } else {
            productElement.style.display = 'none';
        }
    });
}

// Adaugă evenimentul de submit pentru formularul de filtrare
document.getElementById('filter-form').onsubmit = filterProducts;