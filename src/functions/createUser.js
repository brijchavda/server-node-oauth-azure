// src/functions/createUser.js
const { app } = require('@azure/functions');
const { CosmosClient } = require("@azure/cosmos");
const { v4: uuidv4 } = require('uuid');

const connectionString = process.env.COSMOS_DB_CONNECTION_STRING;
const client = new CosmosClient(connectionString);
const database = client.database("UserDB");
const container = database.container("Users");

app.http('createUser', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'users',
    handler: async (request, context) => {
        context.log(`Creating a new user.`);

        try {
            const { name, email, photoURL } = await request.json();

            if (!name || !email) {
                return {
                    status: 400,
                    body: "Please provide a name and email for the user."
                };
            }

            const newUser = {
                id: uuidv4(),
                name,
                email,
                photoURL
            };

            const { resource: createdUser } = await container.items.create(newUser);

            return {
                status: 201,
                jsonBody: createdUser
            };
        } catch (error) {
            context.log.error(error);
            // Check for duplicate email error (unique key constraint)
            if (error.code === 409) {
                 return { status: 409, body: "A user with this email already exists." };
            }
            return { status: 500, body: "Error creating user." };
        }
    }
});