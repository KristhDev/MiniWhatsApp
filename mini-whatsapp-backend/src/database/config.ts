import mongoose from 'mongoose';

const dbConnection = async () => {
    const dbUrl = process.env.MONGODB_CNN || '';

    try {
        await mongoose.connect(dbUrl);
        console.log('Connection to the database successful');
    }
    catch(error) {
        console.log(error);
    }
}

export default dbConnection;