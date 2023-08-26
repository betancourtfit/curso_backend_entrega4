import express from 'express';
// import prodsRouter from './routes/products.routes.js';
// import cartsRouter from './routes/carts.routes.js'; 
import { engine } from 'express-handlebars';
import { __dirname } from './path.js';
import { Server }  from 'socket.io'

import { ProductManager } from './models/products.js';
const manager = new ProductManager();

import path from 'path';

import router from './routes/views.router.js';
const viewsRouter = router;

// Server
const app = express()
const PORT = 8080

const server = app.listen(PORT, () => {
    console.log(`Server on port ${PORT}`)
})

//Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.engine('handlebars', engine()) //Defino que motor de plantillas voy a utilizar y su config
app.set('view engine', 'handlebars') //Setting de mi app de hbs
app.set('views', path.resolve(__dirname, './views')) //Resolver rutas absolutas a traves de rutas relativas
app.use('/static', express.static(path.join(__dirname, '/public'))) //Unir rutas en una sola concatenandolas
app.use('/realtimeproducts', express.static(path.join(__dirname, '/public')))

// Server de socket.io
const io = new Server(server);
const prods = [];

io.on('connection', (socket)=> {
    console.log('servidor de socket io conectado')

    socket.on('nuevoProducto', async (nuevoProd) => {
        const { title, description, price, thumbnail, code, stock } = nuevoProd;
        await manager.addProduct(title, description, price, thumbnail, code, stock);
        const products = await manager.getProducts();
        socket.emit('products-data', products);
    })

    socket.on('update-products', async () => {
        const products = await manager.getProducts();
        socket.emit('products-data', products);
    });

    socket.on('remove-product', async (code) => {
        console.log("inicio remove socket")
        await manager.removeProduct(code) ;
        const products = await manager.getProducts();
        socket.emit('products-data', products);
    })
})

app.use('/',viewsRouter)

app.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', {
        css: "style.css",
        title: "Products",
        js: "realTimeProducts.js"

    })
})

app.get('/static', (req, res) => {
    res.render('home', {
        css: "style.css",
        title: "Home",
        js: "home.js"

    })
})
