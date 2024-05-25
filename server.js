require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const twilio = require('twilio');
const app = express();
const port = 3000;

// Configuración de Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const ownerWhatsAppNumber = process.env.OWNER_WHATSAPP_NUMBER;
const twilioSandboxNumber = 'whatsapp:+14155238886'; // Número de WhatsApp de Twilio para el sandbox
const client = twilio(accountSid, authToken);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Configuración de la base de datos
let db = new sqlite3.Database('./database.sqlite'); // Usar un archivo para persistencia

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS reservas (id INTEGER PRIMARY KEY AUTOINCREMENT, nombre TEXT, email TEXT, fecha TEXT, hora TEXT, personas INTEGER)");
});

// Ruta para la página principal
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Ruta para manejar las reservas
app.post('/reservar', (req, res) => {
  const { nombre, email, fecha, hora, personas } = req.body;
  db.run('INSERT INTO reservas (nombre, email, fecha, hora, personas) VALUES (?, ?, ?, ?, ?)', [nombre, email, fecha, hora, personas], (err) => {
    if (err) {
      console.error('Error al realizar la reserva:', err);
      return res.status(500).send('Error al realizar la reserva');
    }

    // Enviar mensaje de WhatsApp
    const mensaje = `Nueva reserva:\nNombre: ${nombre}\nEmail: ${email}\nFecha: ${fecha}\nHora: ${hora}\nPersonas: ${personas}`;
    console.log('Enviando mensaje:', mensaje);
    console.log('Desde:', twilioSandboxNumber);
    console.log('A:', ownerWhatsAppNumber);
    client.messages.create({
      body: mensaje,
      from: twilioSandboxNumber, // Este es el número de WhatsApp de Twilio (sandbox)
      to: ownerWhatsAppNumber,
    }).then(message => {
      console.log(`Mensaje enviado: ${message.sid}`);
      res.send('Reserva realizada con éxito y mensaje de WhatsApp enviado');
    }).catch(error => {
      console.error('Error al enviar mensaje de WhatsApp:', error);
      res.status(500).send('Reserva realizada, pero no se pudo enviar el mensaje de WhatsApp');
    });
  });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
  console.log('TWILIO_ACCOUNT_SID:', accountSid);
  console.log('TWILIO_AUTH_TOKEN:', authToken ? 'Auth Token presente' : 'Auth Token no presente');
  console.log('OWNER_WHATSAPP_NUMBER:', ownerWhatsAppNumber);
});
