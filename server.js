const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const app = express();
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

// Rute backend
app.get('/products', async (req, res) => {
  try {
      const { name, price } = req.query; // Preia filtrele din query string
      console.log('Filtre primite din query:', { name, price }); // Log pentru debugging

      // Inițializează obiectul `where`
      const where = {};

      // Adaugă condiții pentru `name`
      if (name && name.trim() !== '') {
          where.name = { [Sequelize.Op.like]: `%${name}%` };
          console.log('Filtru adăugat pentru nume:', where.name);
      }

      // Adaugă condiții pentru `price`
      if (price && !isNaN(parseFloat(price))) {
          where.price = { [Sequelize.Op.lte]: parseFloat(price) };
          console.log('Filtru adăugat pentru preț:', where.price);
      }

      console.log('Obiectul WHERE final:', where); // Verifică condițiile finale

      // Obține produsele filtrate
      const products = await Product.findAll({ where });
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

app.delete('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByPk(id);
        if (product) {
            await product.destroy();
            res.status(200).json({ message: 'Produs șters!' });
        } else {
            res.status(404).json({ message: 'Produsul nu a fost găsit!' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Eroare la ștergerea produsului.', error });
    }
});

// Rota pentru update
app.put('/products/:id', async (req, res) => {
  try {
      const { id } = req.params; // Obține ID-ul din URL
      const { name, price } = req.body; // Obține datele din corpul cererii

      // Caută produsul în baza de date
      const product = await Product.findByPk(id);
      if (product) {
          // Actualizează datele produsului
          product.name = name;
          product.price = price;
          await product.save();
          res.status(200).json(product); // Răspuns succes
      } else {
          res.status(404).json({ message: 'Produsul nu a fost găsit!' });
      }
  } catch (error) {
      res.status(500).json({ message: 'Eroare la actualizarea produsului.', error });
  }
});

app.listen(8080, () => {
    console.log('Serverul rulează la http://localhost:8080');
});
