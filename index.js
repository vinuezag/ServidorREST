const express = require('express');
const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Lista para almacenar los objetos JSON recibidos
let lista = [];
let entregados = []; // Lista para los registros entregados

// Método ALL para manejar todas las solicitudes
app.all('*', (req, res, next) => {
    const { method, path, body } = req;
    console.log(`Método: ${method}, Ruta: ${path}`);

    if (method === 'POST' && path === '/guardar-json') {
        // Validar JSON
        const camposPermitidos = ['cedula', 'nombre', 'correo', 'boletos', 'zona'];
        const camposRecibidos = Object.keys(body);
        const camposInvalidos = camposRecibidos.filter(campo => !camposPermitidos.includes(campo));

        if (camposInvalidos.length > 0) {
            return res.status(400).json({ mensaje: 'Campos inválidos en el JSON', camposInvalidos });
        }

        if (!body.cedula || !/^\d{10}$/.test(body.cedula)) {
            return res.status(400).json({ mensaje: 'El campo "cedula" debe tener exactamente 10 dígitos numéricos' });
        }

        if (!body.nombre || !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(body.nombre)) {
            return res.status(400).json({ mensaje: 'El campo "nombre" debe contener solo letras' });
        }

        if (!body.correo || !/\S+@\S+\.\S+/.test(body.correo)) {
            return res.status(400).json({ mensaje: 'El campo "correo" debe ser válido' });
        }

        if (!body.boletos || typeof body.boletos !== 'number') {
            return res.status(400).json({ mensaje: 'El campo "boletos" debe ser un número' });
        }

        if (!body.zona || typeof body.zona !== 'string') {
            return res.status(400).json({ mensaje: 'El campo "zona" debe ser una cadena de texto' });
        }

        // Verificar cédula única
        if (lista.some(item => item.cedula === body.cedula)) {
            return res.status(400).json({ mensaje: 'La cédula ya está registrada' });
        }

        // Guardar JSON
        lista.push(body);
        return res.status(200).json({ mensaje: 'JSON guardado exitosamente', lista });
    }

    if (method === 'GET' && path === '/buscar-registro/:cedula') {
        const cedula = req.params.cedula;
        const registroEncontrado = lista.find(item => item.cedula === cedula);
        if (registroEncontrado) {
            return res.status(200).json(registroEncontrado);
        } else {
            return res.status(404).json({ mensaje: 'Registro no encontrado' });
        }
    }

    if (method === 'PUT' && path === '/actualizar-correo/:cedula') {
        const cedula = req.params.cedula;
        const { correo } = body;

        if (!correo || !/\S+@\S+\.\S+/.test(correo)) {
            return res.status(400).json({ mensaje: 'El campo "correo" debe ser válido' });
        }

        const registroEncontrado = lista.find(item => item.cedula === cedula);
        if (registroEncontrado) {
            registroEncontrado.correo = correo;
            return res.status(200).json({ mensaje: 'Correo actualizado', registro: registroEncontrado });
        } else {
            return res.status(404).json({ mensaje: 'Registro no encontrado' });
        }
    }

    if (method === 'DELETE' && path === '/eliminar-json/:cedula') {
        const cedula = req.params.cedula;
        const index = lista.findIndex(item => item.cedula === cedula);

        if (index === -1) {
            return res.status(404).json({ mensaje: 'Registro no encontrado para eliminar' });
        }

        const [entregado] = lista.splice(index, 1);
        entregados.push(entregado);
        return res.status(200).json({
            mensaje: 'Registro eliminado y añadido a la lista de entregados',
            entregado,
            listaPendiente: lista,
            listaEntregados: entregados,
        });
    }

    if (method === 'GET' && path === '/listado') {
        return res.status(200).json({
            ListaFaltantes: lista,
            ListaEntregados: entregados,
        });
    }

    // Si ninguna ruta coincide
    res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

// Servidor escuchando en el puerto 3000
app.listen(3000, () => {
    console.log('Servidor corriendo en el puerto 3000');
});
