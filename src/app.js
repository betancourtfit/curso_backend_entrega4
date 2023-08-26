import express from 'express';
import prodsRouter from './routes/products.routes.js';
import cartsRouter from './routes/carts.routes.js'; 
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
const mensajes = [];
const prods = [];

io.on('connection', (socket)=> {
    console.log('servidor de socket io conectado')

    // socket.on('mensajeConexion', (user) => {
    //     if(user.rol === "Admin") {
    //         socket.emit('credencialesConexion', 'Usuario válido')
    //     } else {
    //         socket.emit('credencialesConexion', 'Usuario no válido')
    //     }
    // })

    // socket.on('mensaje', (infoMensaje) => {
    //     console.log(infoMensaje)
    //     mensajes.push(infoMensaje)
    //     socket.emit('mensajes', mensajes)
    // })

    socket.on('nuevoProducto', async (nuevoProd) => {
        prods.push(nuevoProd)
        const { title, description, price, thumbnail, code, stock } = nuevoProd;
        manager.addProduct(title, description, price, thumbnail, code, stock);
        const products = await manager.getProducts();
        io.emit('products-data', products);
    })

    socket.on('update-products', async () => {
        const products = await manager.getProducts();
        console.log("updateproducts")
        console.log(products)
        socket.emit('products-data', products);
    });
})
//Routes

app.use('/api/products', prodsRouter)
app.use('/api/carts', cartsRouter)

app.use('/',viewsRouter)

app.get('/static', (req, res) => {
    res.render('realTimeProducts', {
        css: "style.css",
        title: "Products",
        js: "realTimeProducts.js"

    })
})

// app.get('/static', async (req, res) => {
//     const products = await manager.getProducts();
//     res.render('home', {
//         js: "home.js",
//         title: "products",
//         products: products
//     })
// })

// app.get('/', (req, res) => {
//     const products = productManager.getProducts();
//     res.render('home', { 
//         js: "script.js",
//         title: "products",
//         prods: products
//     });
// });

// app.get('/static', (req, res) => {
//     res.render('chat', {
//         js: "script.js",
//         title: "chat"
//     })
// })

// app.get('/static', (req, res) => {
//     const user = {
//         nombre: "Maria",
//         cargo: "Tutor"
//     }

//     const cursos = [
//         { numCurso: 123, dia: "S", horario: "Mañana" },
//         { numCurso: 456, dia: "MyJ", horario: "Tarde" },
//         { numCurso: 789, dia: "LyM", horario: "Noche" }
//     ]
//     res.render('home', {
//         user: user,
//         css: "home.css",
//         title: "Home",
//         esTutor: user.cargo === "Tutor",
//         cursos: cursos
//     })
// })



