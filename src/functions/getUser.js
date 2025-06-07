// src/functions/getUser.js
const { app } = require('@azure/functions');
const { CosmosClient } = require("@azure/cosmos");

const connectionString = process.env.COSMOS_DB_CONNECTION_STRING;
const client = new CosmosClient(connectionString);
const database = client.database("UserDB");
const container = database.container("Users");

app.http('getUser', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'users/{id}',
    handler: async (request, context) => {
        const id = request.params.id;
        // In Cosmos, you must provide the partition key to read an item efficiently.
        // For this example, we will query without it, but this is less performant.
        // A better design would pass the email (partition key) in the route or as a query param.
        context.log(`Getting user with id: ${id}`);
        
        try {
            const querySpec = {
                query: "SELECT * FROM c WHERE c.id = @id",
                parameters: [{ name: "@id", value: id }]
            };

            const { resources: users } = await container.items.query(querySpec).fetchAll();
            
            if (users.length === 0) {
                return { status: 404, body: "User not found." };
            }

            return { jsonBody: users[0] };

        } catch (error) {
            context.log.error(error);
            return { status: 500, body: "Error getting user." };
        }
    }
});