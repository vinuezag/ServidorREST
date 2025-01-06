const express = require('express');
const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Lista para almacenar los objetos JSON recibidos
let lista = [];

// Ruta para manejar el POST y guardar el JSON en la lista
app.post('/guardar-json', (req, res) => {
    const json = req.body; // Extraer el JSON completo del cuerpo de la solicitud

    // Validar que el cuerpo recibido es un objeto JSON
    if (typeof json !== 'object' || json === null || Array.isArray(json)) {
        return res.status(400).json({ mensaje: 'El dato enviado no es un JSON válido' });
    }

    lista.push(json); // Guardar el JSON en la lista
    res.status(200).json({ mensaje: 'JSON guardado exitosamente', lista });
});

// Ruta para buscar un registro por cédula
app.get('/buscar-registro/:cedula', (req, res) => {
    const cedula = req.params.cedula;
    const registroEncontrado = lista.find(registro => registro.cedula === cedula);

    if (registroEncontrado) {
        res.status(200).json(registroEncontrado);
    } else {
        res.status(404).json({ mensaje: 'Registro no encontrado' });
    }
});

app.put('/actualizar-correo/:cedula', (req, res) => {
    const cedula = req.params.cedula;
    const nuevoCorreo = req.body.correo; // Suponiendo que el nuevo correo se envía en el cuerpo de la solicitud

    // Buscar el registro correspondiente
    const registroEncontrado = lista.find(registro => registro.cedula === cedula);

    if (registroEncontrado) {
        // Actualizar el correo electrónico
        registroEncontrado.correo = nuevoCorreo;
        res.status(200).json({ mensaje: 'Correo actualizado con éxito', registro: registroEncontrado });
    } else {
        res.status(404).json({ mensaje: 'Registro no encontrado' });
    }
});

// Servidor escuchando en el puerto 3000
app.listen(3000, () => {
    console.log('La solicitud fue realizada por el puerto 3000'); // Notificación del inicio del server
});
