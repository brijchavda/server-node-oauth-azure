// src/middleware/auth.js

const { OAuth2Client } = require('google-auth-library');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

async function authMiddleware(context, next) {
    const authHeader = context.req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        context.res = {
            status: 401,
            body: 'Authorization header is missing or malformed.'
        };
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        
        // Attach the authenticated user's information to the context
        // so it can be accessed by the function handler.
        context.user = payload; 

        // Proceed to the next middleware or the function handler
        return await next(context);

    } catch (error) {
        context.log.error('Token verification failed:', error);
        context.res = {
            status: 401,
            body: 'Invalid or expired token.'
        };
        return;
    }
}

module.exports = authMiddleware;