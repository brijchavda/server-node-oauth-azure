const { app } = require('@azure/functions');
const { TableClient } = require("@azure/data-tables");

const connectionString = process.env.MyStorageConnectionString;
const tableName = "tasks";

app.http('deleteTask', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    route: 'tasks/{partitionKey}/{rowKey}',
    handler: async (request, context) => {
        context.log(`Delete task request`);

        try {
            const { partitionKey, rowKey } = request.params;
            const client = TableClient.fromConnectionString(connectionString, tableName);

            await client.deleteEntity(partitionKey, rowKey);

            return {
                status: 204 // No Content
            };

        } catch (error) {
            if (error.statusCode === 404) {
                return {
                    status: 404,
                    body: "Task not found."
                };
            }
            context.log.error(error);
            return {
                status: 500,
                body: "Error deleting task."
            };
        }
    }
});