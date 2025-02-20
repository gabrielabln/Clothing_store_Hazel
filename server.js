const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const app = express();  // 🔹 Declari `app` aici

app.use(express.static(path.join(__dirname))); // Servește fișierele statice
app.use(express.json()); // Middleware pentru JSON

// Configurarea bazei de date SQLite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'products.db',
});

// Definirea modelului pentru produse
const Product = sequelize.define('Product', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    image: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
});

// Sincronizarea bazei de date
sequelize.sync({ alter: true }).then(() => {
    console.log('Baza de date sincronizată.');
}).catch((err) => {
    console.error('Eroare la sincronizarea bazei de date:', err);
});

// Definirea rutelor backend
app.get('/products', async (req, res) => {
    try {
        const products = await Product.findAll();
        res.json(products);
    } catch (error) {
        console.error('Eroare la obținerea produselor:', error);
        res.status(500).json({ message: 'Eroare la obținerea produselor.', error });
    }
});

app.post('/products', async (req, res) => {
    try {
        const { name, price, image } = req.body;
        const newProduct = await Product.create({ name, price, image });
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(400).json({ message: 'Eroare la adăugarea produsului.', error });
    }
});

// Configurare PORT pentru Render
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`✅ Serverul rulează pe portul ${PORT}`);
});
