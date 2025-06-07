// src/functions/deleteUser.js
const { app } = require('@azure/functions');
const { CosmosClient } = require("@azure/cosmos");

const connectionString = process.env.COSMOS_DB_CONNECTION_STRING;
const client = new CosmosClient(connectionString);
const database = client.database("UserDB");
const container = database.container("Users");

app.http('deleteUser', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    route: 'users/{id}',
    handler: async (request, context) => {
        const id = request.params.id;
        context.log(`Deleting user with id: ${id}`);
        
        // This is inefficient. A proper implementation MUST have the partition key (email).
        // We are querying for the item first to get its partition key.
        // The request should be DELETE /api/users/{email}/{id}
        const querySpec = {
            query: "SELECT * FROM c WHERE c.id = @id",
            parameters: [{ name: "@id", value: id }]
        };
        const { resources: users } = await container.items.query(querySpec).fetchAll();
        if (users.length === 0) {
            return { status: 404, body: "User not found." };
        }
        const userToDelete = users[0];

        try {
            await container.item(id, userToDelete.email).delete();

            return { status: 204 }; // No Content

        } catch (error) {
             if (error.code === 404) {
                 return { status: 404, body: "User not found." };
            }
            context.log.error(error);
            return { status: 500, body: "Error deleting user." };
        }
    }
});