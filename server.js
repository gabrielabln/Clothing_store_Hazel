const BACKEND_URL = "https://clothing-store-hazel.onrender.com";

// Funcția pentru a obține produsele de la backend
async function fetchProducts() {
    try {
        const response = await fetch(`${BACKEND_URL}/products`);
        const products = await response.json();

        const productsContainer = document.getElementById('products');
        productsContainer.innerHTML = products.map(product => `
            <div class="product">
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>Preț: ${product.price} RON</p>
                <button class="delete-button" data-id="${product.id}">Șterge</button>
                <button class="edit-button" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">Editează</button>
            </div>
        `).join('');

        // Adaugă event listeners pentru butoanele de ștergere și editare
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

    } catch (error) {
        console.error('Eroare la obținerea produselor:', error);
    }
}

// Funcția pentru a trimite un produs nou către backend
async function addProduct(event) {
    event.preventDefault();
    const name = document.getElementById('product-name').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const imageInput = document.getElementById('imagine').files[0];

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
        const response = await fetch(`${BACKEND_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, price, image })
        });

        if (response.ok) {
            fetchProducts();
            document.getElementById('add-product-form').reset();
        } else {
            console.error('Eroare la adăugarea produsului:', await response.text());
        }
    } catch (error) {
        console.error('Eroare la comunicarea cu serverul:', error);
    }
}

// Funcția pentru a șterge un produs
async function deleteProduct(productId) {
    try {
        const response = await fetch(`${BACKEND_URL}/products/${productId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            fetchProducts();
        } else {
            console.error('Eroare la ștergerea produsului:', await response.text());
        }
    } catch (error) {
        console.error('Eroare la comunicarea cu serverul:', error);
    }
}

// Funcția pentru a edita un produs
function editProduct(id, currentName, currentPrice) {
    const editForm = document.getElementById('edit-product-container');
    editForm.style.display = 'block';

    document.getElementById('edit-product-id').value = id;
    document.getElementById('edit-product-name').value = currentName;
    document.getElementById('edit-product-price').value = currentPrice;
}

// Funcția pentru a salva editarea unui produs
async function submitEdit(event) {
    event.preventDefault();

    const id = document.getElementById('edit-product-id').value;
    const name = document.getElementById('edit-product-name').value;
    const price = parseFloat(document.getElementById('edit-product-price').value);

    try {
        const response = await fetch(`${BACKEND_URL}/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, price }),
        });

        if (response.ok) {
            fetchProducts();
            document.getElementById('edit-product-form').reset();
            document.getElementById('edit-product-container').style.display = 'none';
        } else {
            console.error('Eroare la actualizarea produsului:', await response.text());
        }
    } catch (error) {
        console.error('Eroare la comunicarea cu serverul:', error);
    }
}

const PORT = process.env.PORT || 8080;  // Folosește portul dat de Render
app.listen(PORT, () => {
    console.log(`Serverul rulează pe portul ${PORT}`);
});

