// public/script.js
document.getElementById('reserva-form').addEventListener('submit', function(event) {
    event.preventDefault();
  
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const fecha = document.getElementById('fecha').value;
    const hora = document.getElementById('hora').value;
    const personas = document.getElementById('personas').value;
  
    fetch('/reservar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        nombre,
        email,
        fecha,
        hora,
        personas
      })
    })
    .then(response => response.text())
    .then(result => {
      alert(result);
    })
    .catch(error => {
      console.error('Error:', error);
    });
  });
  