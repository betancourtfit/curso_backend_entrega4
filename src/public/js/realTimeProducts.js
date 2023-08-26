const socket = io.connect('http://localhost:8080')
const form = document.getElementById('idForm')
const botonProds = document.getElementById('botonProductos')

form.addEventListener('submit', (e) => {
    e.preventDefault()
    const datForm = new FormData(e.target) //Me genera un objeto iterador
    const prod = Object.fromEntries(datForm) //De un objeto iterable genero un objeto simple
    console.log(prod)
    socket.emit('nuevoProducto', prod)
    e.target.reset()
})

// botonProds.addEventListener('click', () => {
//     socket.on('prods', (prods) => {
//         console.log(prods)
//     })
// })

    socket.on('products-data', (products) => {
        const tableBody = document.querySelector("#productsTable tbody");
        let tableContent = '';

        console.log(products)
        if (products && Array.isArray(products)) {
        products.forEach(product => {
            tableContent += `
                <tr>
                    <td>${product.id}</td>
                    <td>${product.title}</td>
                    <td>${product.description}</td>
                    <td>${product.price}</td>
                    <td>${product.thumbnail}</td>
                    <td>${product.code}</td>
                    <td>${product.stock}</td>
                    <td>${product.status}</td>
                </tr>
            `;
        });
    } else {
        console.error('Productos no definidos o no es un array:', products);
    }

        tableBody.innerHTML = tableContent;
    });

    socket.emit('update-products');
