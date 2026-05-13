import PocketBase from 'pocketbase';

// Detectamos la IP actual de la URL del navegador
const hostname = window.location.hostname;

// Si estás en localhost, usará 127.0.0.1. 
// Si estás desde el móvil, usará la IP de tu Mac automáticamente.
const pb = new PocketBase(`http://${hostname}:8090`);

export default pb;