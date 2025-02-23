import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
/*
> mongoose.connection
> mongoose.connection.db
> mongoose.connecttion.models
> mongoose.connection.readyState
*/



async function config(db = false) {
    try {
        dotenv.config();

        const port = process.env.PORT || 5000;
        const dburl = process.env.MONGODB_URL;
        app.use(cookieParser());  // used for cookie authentication
        app.use(express.json()); // used for json parsing that is used for the body of the request to be displayed in json format
        app.use(cors({
            origin: [process.env.ORIGIN],  //used for CORS that basically is a white list of allowed domains
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
            credentials: true // used for cookie authentication (to send cookies to the client)
        }));


        const server = app.listen(port, () => {
            console.log("Server is running on http://localhost:" + port);
            if (db) {
                connectDB(db.url);
            }
        })
        return app;
    } catch (e) {
        console.log("Config ERROR -------->\n\t", e.message)
    }
}


const generateTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15d" });
    res.cookie("jwt", token, {
        httpOnly: true,  // prevents XSS cross-site scripting attacks by not allowing client-side JavaScript to access the cookie
        sameSite: "strict", // CSRF attack cross-site request forgery attacks
        secure: process.env.NODE_ENV != "development",
        maxAge: 15 * 24 * 60 * 60 * 1000
    });
    return token
}

/**
 * WE CAN USE MVC (MODEL VIEW CONTROLLER) PATTERN BUT HERE, VIEW IS NEXT FRONTEND, MODEL IS MONGODB MODEL AND CONTROLLER IS MONGOOSE 
 * Connects to the MongoDB database using the provided url.
 * If the connection is already established, it simply logs a message and returns the connection.
 * If not, it attempts to connect using the provided url, logs a message with the connection details, and returns the connection.
 * If there is an error, it logs the error message and returns undefined.
 * @param {string} url - The url for the MongoDB database.
 * @returns {import("mongoose").Connection} - The connection object if the connection is successful, undefined otherwise.
 */

async function connectDB(url) {
    try {
        if (mongoose.connection.readyState == 1) {
            console.log("Already connected to the database")
        }
        else {
            await mongoose.connect(process.env.DATABASE_URI || url)
            console.log("Database", mongoose.connection.name, "from the cluster", mongoose.connection.host, mongoose.connection.readyState == 1 ? "connected" : mongoose.connection.readyState == 2 ? "connecting" : "disconnected", "on port:", mongoose.connection.port, "with models", mongoose.connection.models)
        }
    } catch (e) {
        console.log("DATABASE ERROR -------->\n\t", e.message)
        process.exit(1);
    }
    return mongoose.connection
}




/**
 * Creates a new item in the specified MongoDB model and collection.
 * If checkForDuplicates is specified, it checks if an item with those details already exists, and if so, skips creation.
 * If token is true, it generates a JWT token with the data and adds it as a cookie to the response.
 * @param {import("mongoose").Model} model - The MongoDB model to create the item in.
 * @param {object} data - The data to create the item with.
 * @param {object} [checkForDuplicates] - If specified, it checks if an item with these details already exists, and if so, skips creation.
 * @param {boolean} [cookie=false] - If true, token = {name: "", value:"", expiresin:"", httpOnly: , secure:}
 */
const create = async (res, model, data, checkForDuplicates = null, cookieInfo = false) => {
    try {
        if (checkForDuplicates) {
            const existingItem = await model.findOne(checkForDuplicates);
            if (existingItem) {
                console.log("Item already exists. Skipping creation.");
                return;
            }
        }

        if (cookieInfo) {
            const token = jwt.sign(data, cookieInfo.secretKey, { expiresIn: '1h' });
            res.cookie(cookieInfo.name, token, { httpOnly: cookieInfo.httpOnly, secure: cookieInfo.secure, maxAge: cookieInfo.expiresIn * 1000 });
        }

        const savedItem = await model.create(data);
        console.log("Item created:", savedItem);
        return res;
    } catch (error) {
        console.error("Error creating item:", error.message);
        return res.status(500).json({ message: error.message });
    }
};




/**
 * Reads data from the specified model based on the provided query.
 * If `multiple` is true, it retrieves all records that match the query,
 * otherwise, it retrieves a single record.
 * Logs the number of records found or if no record is found.
 * Catches and logs any errors that occur during the read operation.
 * 
 * @param {import("mongoose").Model} model - The model to read data from.
 * @param {Object} [query={}] - The query to filter records.
 * @param {boolean} [multiple=true] - Flag indicating whether to retrieve multiple records or a single record.
 * @returns {Promise<Array|Object|null>} - Returns an array of records if multiple is true, a single record or null otherwise.
 */

const read = async (model, query = {}, multiple = true) => {
    try {
        if (multiple) {
            const records = await model.find(query);
            console.log(`Found ${records.length} records:`, records);
            return records;
        } else {
            const record = await model.findOne(query);
            if (record) {
                console.log("Record found:", record);
            } else {
                console.log("No record found.");
            }
            return record;
        }
    } catch (error) {
        console.error("Error reading data:", error.message);
    }
};
/**
 * Updates a record in the specified model based on the provided query and update data.
 * If the record is found, it logs the updated record and returns it.
 * If the record is not found, it logs a message indicating that no matching record was found.
 * Catches and logs any errors that occur during the update operation.
 * 
 * @param {import("mongoose").Model} model - The model to update the record from.
 * @param {Object} query - The query to filter records.
 * @param {Object} updateData - The data to update the record with.
 * @returns {Promise<Object|null>} - Returns the updated record or null if no matching record is found.
 */
const update = async (model, query, updateData) => {
    try {
        const updatedItem = await model.findOneAndUpdate(query, updateData, { new: true });
        if (updatedItem) {
            console.log("Item updated:", updatedItem);
        } else {
            console.log("No matching item found to update.");
        }
        return updatedItem;
    } catch (error) {
        console.error("Error updating item:", error.message);
    }
};
const deleteItem = async (model, query) => {
    try {
        const deletedItem = await model.findOneAndDelete(query);
        if (deletedItem) {
            console.log("Item deleted:", deletedItem);
        } else {
            console.log("No matching item found to delete.");
        }
        return deletedItem;
    } catch (error) {
        console.error("Error deleting item:", error.message);
    }
};




export default { express, dotenv, cors, cookieParser, bcrypt, jwt, config, mongoose, connectDB, create, read, update, deleteItem, generateTokenAndSetCookie };