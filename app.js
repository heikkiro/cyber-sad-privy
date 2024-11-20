//app.js
import { Hono } from "https://deno.land/x/hono/mod.ts";
import { serveStatic } from "https://deno.land/x/hono/middleware.ts";
import { registerUser } from "./routes/register.js"; //import register logic
import { loginUser } from "./routes/login.js"; // Import login logic


const app = new Hono();

// Serve static files from the /static directory
app.use('/static/*', serveStatic({ root: '.' }));

// Serve the index page
app.get('/', async (c) => {
  return c.html(await Deno.readTextFile('./views/index.html'));
});

// Serve the registration form
app.get('/register', async (c) => {
  return c.html(await Deno.readTextFile('./views/register.html'));
});

// Serve the login form
app.get('/login', async (c) => {
  return c.html(await Deno.readTextFile('./views/login.html'));
});

// Route for user registration (POST request)
app.post('/register', registerUser);

// Route for user login (POST request)
app.post('/login', loginUser);

Deno.serve(app.fetch);

// The Web app starts with the command:
// deno run --allow-net --allow-env --allow-read --watch app.js