const { app } = require('@azure/functions');
const { TableClient } = require("@azure/data-tables");

const connectionString = process.env.MyStorageConnectionString;
const tableName = "tasks";

app.http('updateTask', {
    methods: ['PUT'],
    authLevel: 'anonymous',
    route: 'tasks/{partitionKey}/{rowKey}',
    handler: async (request, context) => {
        context.log(`Update task request`);

        try {
            const { partitionKey, rowKey } = request.params;
            const { description, isCompleted } = await request.json();

            const client = TableClient.fromConnectionString(connectionString, tableName);

            const task = {
                partitionKey,
                rowKey,
                description,
                isCompleted
            };

            await client.updateEntity(task, "Replace"); // Use "Merge" to only update specified properties

            return {
                jsonBody: task
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
                body: "Error updating task."
            };
        }
    }
});