//app.js
import { Hono } from "https://deno.land/x/hono/mod.ts";
import { registerUser } from "./routes/register.js"; //import register logic
import { serveStatic } from "https://deno.land/x/hono/middleware.ts";

const app = new Hono();

// Serve static files from the /static directory
app.use('/static/*', serveStatic({ root: '.' }));

// Serve the registration form
app.get('/register', async (c) => {
  return c.html(await Deno.readTextFile('./views/register.html'));
});

// Route for user registration (POST request)
app.post('/register', registerUser);

Deno.serve(app.fetch);

// The Web app starts with the command:
// deno run --allow-net --allow-env --allow-read --watch app.js