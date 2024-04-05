import { Hono } from 'https://deno.land/x/hono/mod.ts'
import { serveStatic } from 'https://deno.land/x/hono/middleware.ts'

import { Database } from "jsr:@db/sqlite@0.11";

const db = new Database("test.db");

const [version] = db.prepare("select sqlite_version()").value<[string]>()!;
console.log(version);

db.close();

const app = new Hono()

app.use('/static/*', serveStatic({ root: './' }))
app.use('/favicon.ico', serveStatic({ path: './favicon.ico' }))
// app.get('/', (c) => c.text('You can access: /static/hello.txt'))
app.get('/', serveStatic({ path: './static/demo/index.html'} ))


let counter = 0;


app.get('/api/increment', (c) => {
  counter++;
  const updatedHTML = `<h2 id="counter">counter: <span>${counter}</span></h2>`;
  return c.html(updatedHTML);
});


// Make sure to use json() middleware to parse JSON request bodies

app.post('/submit', async (c) => {
const BASE_URL = 'https://script.google.com/macros/s/AKfycbyNTqOTlSBJ1u6Q4vrSsEcw4LKJTOexV1I4eXxdhoE0DcrbEVMrsMQPurkYiFHoJtrWpw/exec';
const TABLE = 'Users';

  try {
    const lastId = await getLastId(BASE_URL, TABLE);
    const newId = lastId + 1;

    const requestBody = await c.req.parseBody();
    const data = {
      id: newId,
      username: requestBody.username,
      email: requestBody.email
      // Additional data fields as needed
    };

    const response = await fetch(`${BASE_URL}?action=insert&table=${TABLE}&data=${encodeURIComponent(JSON.stringify(data))}`, {
      method: 'GET', // Or 'POST', adjust according to your API requirements
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return c.html(`Data dengan <b>id</b> ${data.id} <b>${data.username}</b> berhasil diterima`);
  } catch (error) {
    console.error('Error submitting data:', error);
    return c.status(500).json({ error: 'An error occurred while submitting data.' });
  }
});



const READLAST = 'https://script.google.com/macros/s/AKfycbyNTqOTlSBJ1u6Q4vrSsEcw4LKJTOexV1I4eXxdhoE0DcrbEVMrsMQPurkYiFHoJtrWpw/exec?action=read&table=Users';
async function getLastId(READLAST) {
  const response = await fetch(READLAST);
  if (!response.ok) {
    throw new Error('Failed to fetch the last ID');
  }
  const data = await response.json();
  const lastItem = data.data[data.length - 1];
  return lastItem ? lastItem.id : 0;
}



  




app.get('/users', async (c) => {
  const url = 'https://script.google.com/macros/s/AKfycbyNTqOTlSBJ1u6Q4vrSsEcw4LKJTOexV1I4eXxdhoE0DcrbEVMrsMQPurkYiFHoJtrWpw/exec?action=read&table=Users';

  const startTime = performance.now(); // Record the start time

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    const datas = data.data;
    const processingTime = performance.now() - startTime;

    return c.html(`
      <html>
      <head>
          <title>Appscript data</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="https://cdn.simplecss.org/simple.css">
      </head>
      <body>
      <nav>
      <a href="/">home</a>
      <a href="/products">products</a>
      <a href="/users">users</a>
      </nav>
      <h2>Appscript data</h2>
                  <p>Terdapat ${datas.length} data. Data berhasil diproses dalam waktu: <strong>${processingTime} milliseconds</strong></p>
      <table>
      <tr>
      <th>id</th>
      <th>action</th>
      </tr>
             ${datas.map(data => `
      <tr>
              <td>${data.id}</td>
              <td><a href="/user/${data.id}">Detail</a></td>
      </tr>
      `).join('')}
      </table>
  
      </body>
      </html>
      `);
  } catch (error) {
    console.error('Error fetching data:', error);
    return c.status(500).text('Error fetching data');
  }
});





app.get('/user/:id', async (c) => {

  const URL = 'https://script.google.com/macros/s/AKfycbyNTqOTlSBJ1u6Q4vrSsEcw4LKJTOexV1I4eXxdhoE0DcrbEVMrsMQPurkYiFHoJtrWpw/exec?action=read&table=Users&id=';
  const startTime = performance.now(); // Record the start time

  const id = c.req.param('id');

  try {
    const response = await fetch(URL + id );
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    const datas = data.data;
    const processingTime = performance.now() - startTime;

    return c.html(`
      <html>
      <head>
          <title>${datas.username} detail</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="https://cdn.simplecss.org/simple.css">
      </head>
      <body>
      <nav>
      <a href="/">home</a>
      <a href="/products">products</a>
      <a href="/users">users</a>
      </nav>
      <h2>${datas.username} detail</h2>
      <p>Data berhasil diproses dalam waktu: <strong>${processingTime} milliseconds</strong></p>
      <table>
      <tr>
      <th>id</th>
      <th>email</th>
      <th>username</th>
      </tr>
      <tr>
      <td>${datas.id}</td>
      <td>${datas.email}</td>
      <td>${datas.username}</td>
      </tr>
      </table>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error fetching data:', error);
    return c.status(500).text('Error fetching data');
  }
});





app.get('*', serveStatic({ path: './static/fallback.txt' }))

Deno.serve(app.fetch)
