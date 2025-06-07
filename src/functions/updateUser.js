// src/functions/updateUser.js
const { app } = require('@azure/functions');
const { CosmosClient } = require("@azure/cosmos");

const connectionString = process.env.COSMOS_DB_CONNECTION_STRING;
const client = new CosmosClient(connectionString);
const database = client.database("UserDB");
const container = database.container("Users");

app.http('updateUser', {
    methods: ['PUT'],
    authLevel: 'anonymous',
    route: 'users/{id}',
    handler: async (request, context) => {
        const id = request.params.id;
        context.log(`Updating user with id: ${id}`);
        
        try {
            const { name, photoURL, email } = await request.json();

            if (!email) {
                return { status: 400, body: "The user's email (partition key) must be provided to perform an update." };
            }
            
            const updatedUser = {
                id,
                email, // Partition key must be included
                name,
                photoURL
            };

            // .replace() is an efficient "upsert" that replaces the entire document.
            const { resource: result } = await container.item(id, email).replace(updatedUser);

            return { jsonBody: result };

        } catch (error) {
            if (error.code === 404) {
                 return { status: 404, body: "User not found." };
            }
            context.log.error(error);
            return { status: 500, body: "Error updating user." };
        }
    }
});