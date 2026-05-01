import mongoose from 'mongoose';

const {
    MONGO_URI,
    MONGODB_URI,
    MONGO_DB_NAME = 'house_cleaning_ai',
    MONGO_CONNECT_RETRIES = '5',
    MONGO_CONNECT_RETRY_DELAY_MS = '2000'
} = process.env;

function normalizeEnvValue(value) {
    if (typeof value !== 'string') return undefined;
    const normalized = value.trim().toLowerCase();
    if (!normalized || normalized === 'undefined' || normalized === 'null' || normalized === 'none') {
        return undefined;
    }
    return value.trim();
}

const mongoDbName = normalizeEnvValue(MONGO_DB_NAME) || 'house_cleaning_ai';
const envUri = normalizeEnvValue(MONGO_URI) || normalizeEnvValue(MONGODB_URI);
const mongoUri = envUri || `mongodb://localhost:27017/${mongoDbName}`;

if (envUri) {
    const source = normalizeEnvValue(MONGO_URI) ? 'MONGO_URI' : 'MONGODB_URI';
    console.log(`Using MongoDB URI from ${source}`);
} else {
    console.warn('Warning: no valid MongoDB URI found in MONGO_URI or MONGODB_URI. Falling back to localhost.');
}

const connectOptions = {
};

mongoose.set('strictQuery', false);

let isConnected = false;

export async function connectDB() {
    if (isConnected) return;

    const maxRetries = Number(MONGO_CONNECT_RETRIES) || 5;
    const retryDelay = Number(MONGO_CONNECT_RETRY_DELAY_MS) || 2000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            // Lưu ý: không truyền useNewUrlParser / useUnifiedTopology
            await mongoose.connect(mongoUri, connectOptions);
            isConnected = true;
            console.log('✅ MongoDB connected:', mongoUri);
            attachConnectionHandlers();
            return;
        } catch (err) {
            console.error(`MongoDB connection attempt ${attempt} failed:`, err.message);
            if (attempt < maxRetries) {
                console.log(`Retrying in ${retryDelay}ms...`);
                await new Promise((r) => setTimeout(r, retryDelay));
            } else {
                console.error('❌ Could not connect to MongoDB after max retries.');
                throw err;
            }
        }
    }
}

export async function disconnectDB() {
    if (!isConnected) return;
    try {
        await mongoose.connection.close(false);
        isConnected = false;
        console.log('MongoDB connection closed.');
    } catch (err) {
        console.error('Error closing MongoDB connection:', err);
        throw err;
    }
}

function attachConnectionHandlers() {
    const conn = mongoose.connection;

    conn.on('connected', () => console.log('Mongoose event: connected'));
    conn.on('reconnected', () => console.log('Mongoose event: reconnected'));
    conn.on('disconnected', () => {
        console.warn('Mongoose event: disconnected');
        isConnected = false;
    });
    conn.on('error', (err) => console.error('Mongoose event: error', err));
}