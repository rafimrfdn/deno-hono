import { Hono } from 'https://deno.land/x/hono/mod.ts'
import { serveStatic } from 'https://deno.land/x/hono/middleware.ts'

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

app.get('*', serveStatic({ path: './static/fallback.txt' }))

Deno.serve(app.fetch)
