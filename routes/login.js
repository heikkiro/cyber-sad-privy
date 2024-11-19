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

        // Check if the user exists
        const result = await client.queryArray(
            `SELECT password_hash FROM zephyr_users WHERE username = $1`,
            [username]
        );

        if (result.rows.length === 0) {
            // If no user is found, return an error
            return c.text('Invalid username or password', 400);
        }

        const hashedPassword = result.rows[0][0];

        // Validate the password
        const isPasswordValid = await bcrypt.compare(password, hashedPassword);
        if (!isPasswordValid) {
            return c.text('Invalid username or password', 400);
        }

        // Success response
        return c.text('Login successful!');
    } catch (error) {
        if (error instanceof z.ZodError) {
            // Handle validation errors from Zod
            return c.text(`Validation Error: ${error.errors.map(e => e.message).join(", ")}`, 400);
        }

        console.error(error);
        return c.text('Error during login', 500);
    }
}
