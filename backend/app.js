const express = require('express');
const cors = require('cors');
const { nanoid } = require('nanoid');

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(cors({
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Логирование запросов
app.use((req, res, next) => {
    res.on('finish', () => {
        console.log(`[${new Date().toISOString()}][${req.method}] ${res.statusCode} ${req.path}`);
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
            console.log('Body:', req.body);
        }
    });
    next();
});

// База данных товаров (10+ товаров по ТЗ)
let products = [
    { id: nanoid(6), name: 'Кастрюля "Шеф-Повар" 20л', category: 'Кастрюли', description: 'Нержавеющая сталь, тройное дно', price: 5990, quantity: 15, rating: 4.8, image: '/assets/chef.jpg' },
    { id: nanoid(6), name: 'Кастрюля эмалированная 5л', category: 'Кастрюли', description: 'Классическая эмалированная кастрюля', price: 1200, quantity: 30, rating: 4.2, image: '/assets/' },
    { id: nanoid(6), name: 'Казан чугунный 12л', category: 'Казаны', description: 'Настоящий чугун для плова', price: 3500, quantity: 8, rating: 4.9, image: '/assets/' },
    { id: nanoid(6), name: 'Сотейник антипригарный', category: 'Сотейники', description: 'Антипригарное покрытие, 24см', price: 2100, quantity: 20, rating: 4.5, image: '/assets/' },
    { id: nanoid(6), name: 'Кастрюля нержавеющая 3л', category: 'Кастрюли', description: 'Компактная для ежедневного использования', price: 1800, quantity: 25, rating: 4.3, image: '/assets/' },
    { id: nanoid(6), name: 'Сковорода гриль 28см', category: 'Сковороды', description: 'Чугунная сковорода-гриль', price: 2500, quantity: 12, rating: 4.6, image: '/assets/' },
    { id: nanoid(6), name: 'Ковш для молока 1.5л', category: 'Ковши', description: 'Идеален для каш и соусов', price: 890, quantity: 40, rating: 4.1, image: '/assets/' },
    { id: nanoid(6), name: 'Утятница керамическая', category: 'Формы', description: 'Керамика для запекания в духовке', price: 3200, quantity: 6, rating: 4.7, image: '/assets/utyatnica.jpg' },
    { id: nanoid(6), name: 'Пароварка бамбуковая', category: 'Аксессуары', description: 'Экологичная пароварка', price: 1500, quantity: 10, rating: 4.4, image: '/assets/bamboo.jpg' },
    { id: nanoid(6), name: 'Турка медная 500мл', category: 'Кофе', description: 'Для приготовления настоящего кофе', price: 1100, quantity: 18, rating: 4.8, image: '/assets/turk.jpg' },
    { id: nanoid(6), name: 'Горшок для запекания', category: 'Формы', description: 'Керамический горшок с крышкой', price: 750, quantity: 35, rating: 4.0, image: '/assets/gorshok.jpg' },
    { id: nanoid(6), name: 'Вок сковорода 32см', category: 'Сковороды', description: 'Для жарки на сильном огне', price: 2800, quantity: 9, rating: 4.5, image: '/assets/wok.jpg' }
];

// Главная страница
app.get('/', (req, res) => {
    res.send('Добро пожаловать в API Магазина Кастрюль!');
});

// CRUD операции

// GET все товары
app.get('/api/products', (req, res) => {
    res.json(products);
});

// GET товар по ID
app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) {
        return res.status(404).json({ error: 'Товар не найден' });
    }
    res.json(product);
});

// POST создать товар
app.post('/api/products', (req, res) => {
    const { name, category, description, price, quantity, rating, image } = req.body;
    
    if (!name || !price) {
        return res.status(400).json({ error: 'Название и цена обязательны' });
    }

    const newProduct = {
        id: nanoid(6),
        name,
        category: category || 'Другое',
        description: description || '',
        price: Number(price),
        quantity: Number(quantity) || 0,
        rating: Number(rating) || 0,
        image: image || ''
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
});

// PATCH обновить товар
app.patch('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) {
        return res.status(404).json({ error: 'Товар не найден' });
    }

    const { name, category, description, price, quantity, rating, image } = req.body;
    if (name) product.name = name;
    if (category) product.category = category;
    if (description) product.description = description;
    if (price) product.price = Number(price);
    if (quantity !== undefined) product.quantity = Number(quantity);
    if (rating) product.rating = Number(rating);
    if (image) product.image = image;

    res.json(product);
});

// DELETE удалить товар
app.delete('/api/products/:id', (req, res) => {
    const exists = products.some(p => p.id === req.params.id);
    if (!exists) {
        return res.status(404).json({ error: 'Товар не найден' });
    }
    products = products.filter(p => p.id !== req.params.id);
    res.status(204).send();
});

// 404 для остальных маршрутов
app.use((req, res) => {
    res.status(404).json({ error: 'Маршрут не найден' });
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// Запуск
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});