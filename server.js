
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const productRoutes = require('./routes/products');
const deptRoutes = require('./routes/departments');
const authRoutes = require('./routes/auth');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/departments', deptRoutes);

app.listen(5000, () => console.log('Server running on 5000'));
