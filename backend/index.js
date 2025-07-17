import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
/*
> mongoose.connection
> mongoose.connection.db
> mongoose.connecttion.models
> mongoose.connection.readyState
*/
import victor from "./utility.js";
import usermodel from "./models/patient.models.js";
import notificationModel from './models/notification.model.js';
import postModel from './models/post.model.js';
import doctorModel from './models/doctor.model.js';
import patientModels from './models/patient.models.js';
import Post from "../backend/models/post.model.js";
import commentModel from './models/comment.model.js';

const app = express();
const port = process.env.PORT || 7000;
// app.use(cors({
//     // origin: 'http://localhost:3000',  // Change this to your frontend URL
//     // methods: ['GET', 'POST', 'PUT', 'DELETE'], // Add the methods you need
//     // allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers if needed
// }));
app.use(cors({
    origin: "http://localhost:3000",  // Frontend URL
    methods: ["GET", "POST"],
    credentials: true,  // Allow cookies to be sent
}));
dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})
app.use(express.urlencoded({ extended: true }));  // if the form data is in urlencoded format, use this
app.use(express.json()); // used for json parsing that is used for the body of the request to be displayed in json format
app.use(cookieParser());  // puts the cookie in the request object
// app.use(cors({ origin: [process.env.ORIGIN], methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], credentials: true }));
app.listen(port, async () => {
    console.log("Server is running on http://localhost:" + port);
    victor.connectDB("mongodb+srv://priyeshkjace101mongo:IyYmBc8pBot3gi71@cluster0.1z68r.mongodb.net/");

})


const doctor_signup = async (req, res) => {
    try {
        const { fullName, email, phone, dob, gender, specialization, licenseNumber, qualifications, hospitalAffiliation, experience, certifications, password } = req.body;

        if (!fullName || !email || !phone || !specialization || !licenseNumber || !password) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        const existingUser = await usermodel.findOne({ licenseNumber });
        if (existingUser) {
            return res.status(400).json({ message: "License number is already registered" });
        }
        const existingUser1 = await usermodel.findOne({ email });
        if (existingUser1) {
            return res.status(400).json({ message: "Email entered is already registered" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newDoctor = new doctorModel({
            name: fullName,
            email,
            phone,
            dob,
            gender,
            specialization,
            licenseNumber,
            qualifications,
            hospitalAffiliation,
            experience,
            certifications: certifications ? certifications.split(",") : [],
            password: hashedPassword,
        });

        if (newDoctor) {
            // generate a token
            generateTokenAndSetCookie({ id: newDoctor._id, role: "doctor" }, res);
            await newDoctor.save();
            return res.status(201).json({
                _id: newDoctor._id,
                name: newDoctor.name,
                email: newDoctor.email,
                phone: newDoctor.phone,
                dob: newDoctor.dob,
                gender: newDoctor.gender,
                specialization: newDoctor.specialization,
                licenseNumber: newDoctor.licenseNumber,
                qualifications: newDoctor.qualifications,
                hospitalAffiliation: newDoctor.hospitalAffiliation,
                experience: newDoctor.experience,
                certifications: newDoctor.certifications,
                password: newDoctor.password
            });
        }
        else {
            return res.status(500).json({ message: "Doctor not created" });
        }

    } catch (error) {
        console.log("DOCTOR_SIGNUP ERROR:", e.message);
        return res.status(500).json({ message: e.message });
    }
}


const patient_signup = async (req, res) => {
    try {
        // console.log(req.body)
        const { name, email, phone, dob, gender, password, location, profilePicture } = req.body;
        // console.log(email)
        if (!email || !password) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }
        const existingUser = await usermodel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email is already registered" });
        }
        console.log(password.length)
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newPatient = new patientModels({
            name,
            email,
            phone,
            dob,
            gender,
            location,
            password: hashedPassword,
            // profilePicture
        });

        if (newPatient) {
            // generate a token
            generateTokenAndSetCookie({ id: newPatient._id, role: "patient" }, res);
            await newPatient.save();
            console.log("dd")
            return res.status(201).json({
                message: "Patient created successfully", data: {
                    _id: newPatient._id,
                    name: newPatient.name,
                    email: newPatient.email,
                    phone: newPatient.phone,
                    dob: newPatient.dob,
                    gender: newPatient.gender,
                    location: newPatient.location,
                    // password: newPatient.password
                }
            })
        }
        else {
            return res.status(500).json({ message: "Patient not created" });
        }

    } catch (e) {
        console.log("PATIENT_SIGNUP ERROR:", e.message);
        return res.status(500).json({ message: e.message });
    }
}



const doctor_login = async (req, res) => {
    try {
        const { email, password, licenseNumber } = req.body;
        if (!email || !licenseNumber || !password) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const user = await doctorModel.findOne({ licenseNumber });
        if (!user) {
            return res.status(404).json({ message: "Doctor not found" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }
        // generate a token
        victor.generateTokenAndSetCookie({ id: user._id, role: "doctor" }, res);
        return res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            dob: user.dob,
            gender: user.gender,
            specialization: user.specialization,
            licenseNumber: user.licenseNumber,
            qualifications: user.qualifications,
            hospitalAffiliation: user.hospitalAffiliation,
            experience: user.experience,
            certifications: user.certifications,
            password: user.password
        });

    } catch (e) {
        console.log("DOCTOR_LOGIN ERROR:", e.message);
        return res.status(500).json({ message: e.message });
    }
}
const patient_login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            console.log("Missing required fields")
            return res.status(400).json({ message: "Missing required fields" });
        }
        const user = await patientModels.findOne({ email });
        if (!user) {
            console.log("Patient not found")
            return res.status(404).json({ message: "Patient not found" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log("Invalid password")
            return res.status(401).json({ message: "Invalid password" });
        }
        // generate a token
        generateTokenAndSetCookie({ id: user._id, role: "patient" }, res);
        return res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            dob: user.dob,
            gender: user.gender,

        })

    } catch (e) {
        console.log("DOCTOR_LOGIN ERROR:", e.message);
        return res.status(500).json({ message: e.message });
    }
}



const logout = async (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        return res.status(200).json({ message: "User signed out successfully" });
    }
    catch (e) {
        console.log("SIGNOUT ERROR:", e.message);
        return res.status(500).json({ message: e.message });
    }
}


// stops the request if the cookie is absent/ invalid/ user not found. If user found, sends the user as request to the next middleware
const protectedRoutePatient = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        console.log("token:", token);
        // if no token, handle it
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No Token provided" });
        }
        console.log("Provided token in patientRoutePatient", token);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("DECODED TOKEN :", decoded);
        // if invalid token, handle it
        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized: Invalid Token" });
        };

        const user = await patientModels.findById(decoded.userId.id).select("-password");
        // console.log("decoded:", decoded);
        // if user not found from the token, handle it
        if (!user) {
            return res.status(404).json({ message: "Patient not found from the token" });
        }
        // if user found from the token, send the user as request to the next middleware
        console.log("PROTECTED USER:", user.name);
        req.user = user;
        next();
    }
    catch (e) {
        console.log("PROTECTED ERROR:", e.message);
        return res.status(500).json({ message: e.message });
    }
}
const protectedRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        // if no token, handle it
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No Token provided" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // if invalid token, handle it
        if (!decoded) {
            return res.status(401).json({ message: "Unauthorized: Invalid Token" });
        };

        // const user = await usermodel.findById(decoded.userId).select("-password");
        console.log("decoded:", decoded);
        // if user not found from the token, handle it
        if (!user) {
            return res.status(404).json({ message: "User not found from the token" });
        }
        // if user found from the token, send the user as request to the next middleware
        console.log("PROTECTED USER:", user.username);
        req.user = user;
        next();
    }
    catch (e) {
        console.log("PROTECTED ERROR:", e.message);
        return res.status(500).json({ message: e.message });
    }
}


const getMe = async (req, res) => {
    try {
        const user = await usermodel.findById(req.user._id).select("-password");
        console.log("GETME USER:", user);
        return res.status(200).json(user);

    } catch (e) {
        console.log("GETME ERROR:", e.message);
        return res.status(500).json({ message: e.message });
    }
}


const generateTokenAndSetCookie = (userId, res) => {
    // const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15d" });
    // // res.cookie("jwt", token, {
    // //     httpOnly: true,  // prevents XSS cross-site scripting attacks by not allowing client-side JavaScript to access the cookie
    // //     sameSite: "strict", // CSRF attack cross-site request forgery attacks
    // //     secure: process.env.NODE_ENV != "development",
    // //     maxAge: 15 * 24 * 60 * 60 * 1000
    // // });
    // res.cookie("jwt", token, {
    //     httpOnly: true,  // Prevents access to cookie via JavaScript
    //     sameSite: "None", // Allow cross-origin requests
    //     secure: process.env.NODE_ENV === "production", // Secure flag needs to be true in production, false in dev
    //     maxAge: 15 * 24 * 60 * 60 * 1000 // Cookie expiration time (15 days)
    // });

    // return token
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15d" });

    const isProduction = process.env.NODE_ENV === "production"; // Check if in production environment

    res.cookie("jwt", token, {
        // httpOnly: true,           // Prevent JavaScript access to the cookie
        // sameSite: "None",         // Allow cross-origin requests
        // secure: false,     // Only secure in production (for HTTPS)
        maxAge: 15 * 24 * 60 * 60 * 1000, // Cookie expiry time (15 days)
    });
}




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





const getUserProfile = async (req, res, next) => {
    const { username } = req.params;
    try {
        const user = await usermodel.findOne({ username }).select("-password");
        if (!user) {
            return res.status(404).json({ error: "The user requested was not found" });
        }
        return res.status(200).json(user);
    } catch (e) {
        res.status(500).json({ error: e.message });
        console.log("GET USER ERROR:", e.message);
    }
}


const followunfollowuser = async (req, res, next) => {
    const { id } = req.params;
    try {
        const userToFollow_Unfollow = await usermodel.findById(id);
        const currentUser = await usermodel.findById(req.user._id);
        if (userToFollow_Unfollow == currentUser) {
            return res.status(400).json({ error: "You cannot follow yourself" });
        }
        if (!userToFollow_Unfollow || !currentUser) {
            return res.status(404).json({ error: "The user requested was not found" });
        }
        const isFollowing = currentUser.following.includes(userToFollow_Unfollow._id);
        if (isFollowing) {// unfollow the userToModify
            await usermodel.findByIdAndUpdate(currentUser._id, { $pull: { following: userToFollow_Unfollow._id } }, { new: true });
            await usermodel.findByIdAndUpdate(userToFollow_Unfollow._id, { $pull: { followers: currentUser._id } }, { new: true });
            // notification of unfollow request from me to the person sent
            const newNotification = new notificationModel({
                type: "unfollow",
                from: req.user._id,
                to: userToFollow_Unfollow._id
            })
            await newNotification.save();
            return res.status(200).json({ message: "User unfollowed successfully", userToFollow_Unfollow });
        } else {// follow the userToModify
            await usermodel.findByIdAndUpdate(currentUser._id, { $push: { following: userToFollow_Unfollow._id } }, { new: true });
            await usermodel.findByIdAndUpdate(userToFollow_Unfollow._id, { $push: { followers: currentUser._id } }, { new: true });
            // notification of follow request from me to the person sent
            const newNotification = new notificationModel({
                type: "follow",
                from: req.user._id,
                to: userToFollow_Unfollow._id
            })
            await newNotification.save();
            return res.status(200).json({ message: "User followed successfully", userToFollow_Unfollow });
        }

    } catch (e) {
        res.status(500).json({ followunfollowUserError: e.message });
        console.log("FOLLOW/ UNFOLLOW USER ERROR:", e.message);
    }
}


const getSuggestedUsers = async (req, res, next) => {
    try {
        const currentUserId = req.user._id;
        const usersFollowedByCurrentUser = await usermodel.findById(currentUserId).select("following");
        const usersSuggested = await usermodel.aggregate([
            { $match: { _id: { $ne: currentUserId } } },
            { $sample: { size: 10 } }
        ])

        const usersSuggestedFiltered = usersSuggested.filter(user => !usersFollowedByCurrentUser.following.includes(user._id)).slice(0, 5);

        return res.status(200).json(usersSuggestedFiltered);
    } catch (e) {
        res.status(500).json({ getSuggestedUsersError: e.message });
        console.log("GET SUGGESTED USERS ERROR:", e.message);
    }
}


const updateUser = async (req, res, next) => {
    const currentUserId = req.user._id;
    const { fullName, username, email, currentPassword, newPassword, bio, link } = req.body;
    let { profileImg, coverImg } = req.body;
    try {
        const currentUser = await usermodel.findById(currentUserId);
        if (!currentUser) {
            return res.status(404).json({ error: "Your cookie doesnot provide a user" });
        }
        if ((currentPassword && !newPassword) || (!currentPassword && newPassword)) {
            return res.status(400).json({ error: "You must provide both currentPassword and newPassword" });
        }
        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, currentUser.password);
            if (!isMatch) {
                return res.status(401).json({ error: "Invalid currentPassword" });
            }
            if (newPassword.length < 6) {
                return res.status(400).json({ error: "Password must be at least 6 characters" });
            }
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            currentUser.password = hashedPassword;
        }
        if (profileImg) {
            if (currentUser.profileImg) {
                await cloudinary.uploader.destroy(currentUser.profileImg.split("/").pop().split(".")[0]);
            }
            const uploadedResponse = await cloudinary.uploader.upload(profileImg);
            profileImg = uploadedResponse.secure_url;
        }
        if (coverImg) {
            const uploadedResponse = await cloudinary.uploader.upload(coverImg);
            coverImg = uploadedResponse.secure_url;
        }
        currentUser.fullName = fullName || currentUser.fullName;
        currentUser.username = username || currentUser.username;
        currentUser.email = email || currentUser.email;
        currentUser.bio = bio || currentUser.bio;
        currentUser.link = link || currentUser.link;
        currentUser.profileImg = profileImg || currentUser.profileImg;
        currentUser.coverImg = coverImg || currentUser.coverImg;

        const newUser = await currentUser.save();
        // password should not be sent as resonse, it should be null
        newUser.password = null
        return res.status(200).json(newUser);
    } catch (e) {
        res.status(500).json({ updateUserError: e.message });
        console.log("UPDATE USER ERROR:", e.message);
    }
}

const createPost = async (req, res, next) => {
    try {
        const userId = req.user._id.toString();
        const { text } = req.body;
        let { img } = req.body;
        const user = await usermodel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "Your cookie doesnot provide a user" });
        }
        if (!text && !img) {
            return res.status(400).json({ error: "You must provide a text or an image" });
        }
        if (img) {
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }
        const newPost = new postModel({
            user: userId,
            text,
            img
        })

        await newPost.save();
        res.status(200).json(newPost);
    } catch (e) {
        res.status(500).json({ createPostError: e.message });
        console.log("CREATE POST ERROR:", e.message);
    }
}


const deletePost = async (req, res, next) => {
    const userId = req.user._id.toString();
    try {
        const user = await usermodel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "Your cookie doesnot provide a user" });
        }
        const postIdToBeDeleted = req.params.id;
        const post = await postModel.findById(postIdToBeDeleted);
        if (!post) {
            return res.status(404).json({ error: "The post you wanted to delete was not found" });
        }
        if (post.user.toString() !== userId) {
            return res.status(401).json({ error: "You are not authorized to delete this post" });
        }
        if (post.img) {
            await cloudinary.uploader.destroy(post.img.split("/").pop().split(".")[0]);
        }
        await postModel.findByIdAndDelete(postIdToBeDeleted);
        return res.status(200).json({ message: "Post deleted successfully" });

    } catch (e) {
        res.status(500).json({ deletePostError: e.message });
        console.log("DELETE POST ERROR:", e.message);
    }
}

const createComment = async (req, res, next) => {
    try {
        const userId = req.user._id.toString();
        const postId = req.params.id;
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: "You must provide a text" });
        }
        const user = await usermodel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "Your cookie doesnot provide a user" });
        }
        const post = await postModel.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "The post you wanted to comment on was not found" });
        }
        const comment = { user: userId, text };
        post.comments.push(comment);
        await post.save();
        return res.status(200).json({ message: "Comment created successfully", post });
    } catch (e) {
        res.status(500).json({ createCommentError: e.message });
        console.log("CREATE COMMENT ERROR:", e.message);
    }
}

const likeunlikepost = async (req, res, next) => {
    try {
        const userId = req.user._id.toString();
        const postId = req.params.id;
        const post = await postModel.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "The post you wanted to like/unlike was not found" });
        }
        if ((userId == post.user.toString())) {
            return res.status(400).json({ error: "You cannot like/unlike your own post" });
        }
        if (post.likes.includes(userId)) {
            post.likes = post.likes.filter(id => id !== userId);
            await post.save();
            return res.status(200).json({ message: "Post unliked successfully", post });
        }
        else {
            post.likes.push(userId);
            await post.save();
            const newNotification = new notificationModel({
                type: "like",
                from: userId,
                to: post.user
            })
            await newNotification.save();
            return res.status(200).json({ message: "Post liked successfully", post });
        }
    } catch (e) {
        res.status(500).json({ likeunlikepostError: e.message });
        console.log("LIKE/UNLIKE POST ERROR:", e.message);
    }
}


const getAllPosts = async (req, res, next) => {
    try {
        const posts = await postModel.find().sort({ createdAt: -1 }).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        });
        if (!posts) {
            return res.status(200).json({ error: "No posts found" });
        }
        return res.status(200).json(posts);
    } catch (e) {
        res.status(500).json({ getAllPostsError: e.message });
        console.log("GET ALL POSTS ERROR:", e.message);
    }
}

const getLikedPosts = async (req, res, next) => {
    try {
        const userId = req.user._id.toString();
        if (!userId) {
            return res.status(404).json({ error: "Your cookie doesnot provide a user" });
        }
        const likedPosts = await postModel.find({ _id: { $in: userId } }).populate({
            path: "user",
            select: "-password"
        }).populate({
            path: "comments.user",
            select: "-password"
        })
        return res.status(200).json(likedPosts);

    }
    catch (e) {
        res.status(500).json({ getLikedPostsError: e.message });
        console.log("GET LIKED POSTS ERROR:", e.message);
    }
}

app.post("/api/auth/doctor_signup", doctor_signup);
app.post("/api/auth/patient_signup", patient_signup);
app.post("/api/auth/patient_login", patient_login);
// app.post("/api/auth/signup", signup); //ok
// app.post("/api/auth/login", login); //ok
app.post("/api/auth/logout", logout); //ok
app.get("/api/getme", protectedRoute, getMe); //ok
app.get("/api/users/profile/:username", protectedRoute, getUserProfile);// ok
app.get("/api/users/suggested", protectedRoute, getSuggestedUsers); // TODO: not ok
app.post("/api/users/follow/:id", protectedRoute, followunfollowuser); //OK
app.post("/api/users/updateUser", protectedRoute, updateUser);//ok
// app.post("/api/posts/create", protectedRoute, createPost); //ok
// app.get("/api/posts/create", protectedRoute, createPost);
// app.get("/api/posts/create", protectedRoute, createPost);
// app.delete("/api/posts/delete/:id", protectedRoute, deletePost);//ok
// app.post("/api/posts/likeunlikepost/:id", protectedRoute, likeunlikepost);//ok
// app.post("/api/posts/comment/:id", protectedRoute, createComment);
// app.post("/api/posts/getallposts", protectedRoute, getAllPosts);
// app.post("/api/posts/getlikedposts", protectedRoute, getLikedPosts);
app.post("/api/findDoctorsNearby", protectedRoutePatient, async (req, res) => {
    try {
        // Fetch the user
        const patient = req.user;
        const location = req.body;
        console.log("THE USER FOR FIND DOCTORS NEARBY IS :", req.user);
        const userId = patient._id;
        const user = await patientModels.findById(userId);
        // if (!user) {
        //     console.log("User not found");
        //     return [];
        // }

        // Extract city, state, and country from user's location
        const userLocationParts = patient.location.split(',').map(part => part.trim());
        const userCity = userLocationParts[userLocationParts.length - 3] || '';
        const userState = userLocationParts[userLocationParts.length - 2] || '';
        const userCountry = userLocationParts[userLocationParts.length - 1] || '';
        // console.log("User is from:", "'", userCity, "'", "'", userState, "'", userCountry, "'");

        // Find doctors with matching city, state, and country
        const doctors = await doctorModel.find(); // Fetch all doctors
        // const filteredDoctors = doctors.filter(doctor => {
        //     if (!doctor.location) return false; // Skip if location is missing

        //     const [doctorCity, doctorState, doctorCountry] = doctor.location.split(",").map(s => s.trim());

        //     return doctorCity === userCity && doctorState === userState && doctorCountry === userCountry;
        // });
        // console.log(doctors)
        const doctorList = [];
        let i = 0;
        doctors.map((doc) => {
            if (doc.location.includes(location.city)) {
                console.log(doc.location);
                console.log(userCity);
                doctorList.push(doc)
                i++;
            }
        })
        // const location = doctors.map((el) => {
        //     const len = el.location.split(",").length;
        //     const city = el.location.split(",")[len - 3];
        //     const state = el.location.split(",")[len - 2];
        //     const country = el.location.split(",")[len - 1];
        //     if (city.trim() == userCity.trim()) {
        //         if (state.trim() == userState.trim()) {
        //             if (country.trim() == userCountry.trim()) {
        //                 doctorList.push(el)
        //             }
        //         }
        //     }
        //     // doctorList.push(city, state, country)
        // })
        if (doctorList.length === 0) return res.status(404).json({ message: "No doctors found in the same city, state, and country" });
        // console.log(doctorList)
        console.log("Found", i, "doctors in the same city, state, and country");
        // console.log("Doctors in the same city, state, and country:", doctors.location.split(",").map(s => s.trim()));
        return res.status(200).json({ message: "Doctors found successfully", data: doctorList });
    } catch (error) {
        console.error("Error fetching doctors:", error);
        return [];
    }

});


app.post("/api/profile", protectedRoutePatient, async (req, res) => {
    try {
        const user = req.user;
        console.log(user)
        res.status(200).json(user);
    }
    catch (e) {
        res.status(500).json({ profileError: e.message });
        console.log("PROFILE ERROR:", e.message);
    }
});





// Create a post
app.post("/api/posts", protectedRoutePatient, async (req, res) => {
    try {
        const user = req.user;
        const userId = user._id.toString();
        const userType = "patient";
        const content = req.body.content;
        const userGroup = req.body.group;
        console.log(user)
        console.log(req.body)
        const newPost = new Post({
            userId,
            userType,
            content,
            group: userGroup
        });
        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all posts
// app.post("/api/getPosts", protectedRoutePatient, async (req, res) => {
//     try {

//         const group = req.body.group;
//         console.log("Group is ", group)
//         const posts = await Post.find({ group }).sort({ createdAt: -1 });
//         console.log("Posts are", posts)
//         res.status(200).json(posts);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

app.post("/api/getPosts", protectedRoutePatient, async (req, res) => {
    try {
        const posts = await Post.find({ group: req.body.group })
        // .populate({
        //     path: "comments",
        //     model: "commentModel", // Ensure this matches your comment model name
        //     select: "content userId", // Only fetch necessary fields
        // })
        // .sort({ createdAt: -1 });
        console.log("Posts are", posts)
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Get a single post by ID
app.get("api/posts/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a post
app.put("api/posts/:id", async (req, res) => {
    try {
        const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedPost) return res.status(404).json({ message: "Post not found" });
        res.status(200).json(updatedPost);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a post
app.delete("/:id", async (req, res) => {
    try {
        const deletedPost = await Post.findByIdAndDelete(req.params.id);
        if (!deletedPost) return res.status(404).json({ message: "Post not found" });
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Like/Unlike a post
app.post("/api/posts/like", protectedRoutePatient, async (req, res) => {
    try {
        const user = req.user;
        const postId = req.body.postId;
        console.log(user, postId)
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        // const userId = req.body.userId;
        const userId = user._id.toString();
        if (post.likes.includes(userId)) {
            post.likes = post.likes.filter(id => id.toString() !== userId);
        } else {
            post.likes.push(userId);
        }
        await post.save();
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.post("/api/posts/dislike", protectedRoutePatient, async (req, res) => {
    try {
        const user = req.user;
        const postId = req.body.postId;
        console.log(user, postId)
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        // const userId = req.body.userId;
        const userId = user._id.toString();
        if (post.dislikes.includes(userId)) {
            post.dislikes = post.dislikes.filter(id => id.toString() !== userId);
        } else {
            post.dislikes.push(userId);
        }
        await post.save();
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})


// Comment on a post
app.post("/api/posts/comment", protectedRoutePatient, async (req, res) => {
    try {
        const user = req.user;
        // const {postId, comment} = req.body;
        const post = await Post.findById(req.body.postId);
        if (!post) return res.status(404).json({ message: "Post not found" });
        const comment = new commentModel({
            userId: user._id,
            userType: "patient",
            content: req.body.comment,
            post: req.body.postId
        })
        await comment.save();
        post.comments.push(comment._id);
        await post.save();
        res.status(200).json(comment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.post("/api/posts/getDoctors", protectedRoutePatient, async (req, res) => {
    try {
        const user = req.user;
        const { group } = req.body;
        console.log(group)
        const doctorList = await doctorModel.find({ group });
        res.status(200).json(doctorList);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

