const { app } = require('@azure/functions');
const { TableClient } = require("@azure/data-tables");

const connectionString = process.env.MyStorageConnectionString;
const tableName = "tasks";

app.http('createTask', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'tasks',
    handler: async (request, context) => {
        context.log(`Create task request`);

        try {
            const { partitionKey, rowKey, description } = await request.json();

            if (!partitionKey || !rowKey || !description) {
                return {
                    status: 400,
                    body: "Please provide partitionKey, rowKey, and description for the task."
                };
            }

            const client = TableClient.fromConnectionString(connectionString, tableName);

            const task = {
                partitionKey,
                rowKey,
                description,
                isCompleted: false
            };

            await client.createEntity(task);

            return {
                status: 201,
                jsonBody: task
            };

        } catch (error) {
            context.error(error);
            return {
                status: 500,
                body: "Error creating task."
            };
        }
    }
});