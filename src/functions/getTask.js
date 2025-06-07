// src/functions/getTask.js

const { app } = require('@azure/functions');
const { TableClient } = require("@azure/data-tables");
const authMiddleware = require('../middleware/auth'); // 1. Import the middleware

const connectionString = process.env.MyStorageConnectionString;
const tableName = "tasks";

const getTaskHandler = async (request, context) => {
    // 3. Access the authenticated user from the context
    context.log(`Get task request by user: ${context.user.email}`); 

    try {
        const { partitionKey, rowKey } = request.params;
        const client = TableClient.fromConnectionString(connectionString, tableName);
        const task = await client.getEntity(partitionKey, rowKey);

        return { jsonBody: task };

    } catch (error) {
        if (error.statusCode === 404) {
            return { status: 404, body: "Task not found." };
        }
        context.log.error(error);
        return { status: 500, body: "Error getting task." };
    }
};

app.http('getTask', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'tasks/{partitionKey}/{rowKey}',
    // 2. Add the middleware before the handler
    // handler: [authMiddleware, getTaskHandler] 
    handler: [getTaskHandler] 
});