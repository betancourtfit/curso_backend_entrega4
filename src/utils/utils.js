import { Express } from "express";
//Rutas


const app = express()

//Middleware
app.use(express.json())
app.use(express.urlencoded())

//routes
app.use('api/products', prodsRouter)

