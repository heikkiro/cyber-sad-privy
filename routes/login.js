import client from "../db/db.js";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";
import { z } from "https://deno.land/x/zod@v3.16.1/mod.ts"; // Import Zod

// Zod schema for validating the login form
const loginSchema = z.object({
    username: z.string().email({ message: "Invalid email address" }).max(50, "Email must not exceed 50 characters"),
    password: z.string().min(1, "Password is required"), // Ensure password is not empty
});

// Handle user login
export async function loginUser(c) {
    const body = await c.req.parseBody();
    const { username, password } = body;

    try {
        // Validate input using Zod
        loginSchema.parse({ username, password });

        // Check if the user exists and fetch user_token and password_hash
        const result = await client.queryArray(
            `SELECT user_token, password_hash FROM zephyr_users WHERE username = $1`,
            [username]
        );

        if (result.rows.length === 0) {
            // If no user is found, return an error
            return c.text('Invalid username or password', 400);
        }

        const [userToken, hashedPassword] = result.rows[0];

        // Validate the password
        const isPasswordValid = await bcrypt.compare(password, hashedPassword);
        if (!isPasswordValid) {
            return c.text('Invalid username or password', 400);
        }

        console.log('Raw Headers:', c.req.raw.headers);
        console.log('Remote Addr:', c.req.raw.conn?.remoteAddr?.hostname);

        // Safely extract the client's IP address using raw headers
        let ipAddress = 'Unknown'; // Default fallback
        const rawHeaders = c.req.raw.headers;

        if (rawHeaders.get('X-Forwarded-For')) {
            ipAddress = rawHeaders.get('X-Forwarded-For');
        } else if (c.req.raw.conn && c.req.raw.conn.remoteAddr) {
            ipAddress = c.req.raw.conn.remoteAddr.hostname;
        } else {
            ipAddress = '127.0.0.1'; // Localhost fallback for development
        }

        // Log the successful login to the database
        await client.queryArray(
            `INSERT INTO login_logs (user_token, ip_address) VALUES ($1, $2)`,
            [userToken, ipAddress]
        );

        // Redirect to index page after successful login
        return c.redirect('/');

    } catch (error) {
        if (error instanceof z.ZodError) {
            // Handle validation errors from Zod
            return c.text(`Validation Error: ${error.errors.map(e => e.message).join(", ")}`, 400);
        }

        console.error(error);
        return c.text('Error during login', 500);
    }
}
