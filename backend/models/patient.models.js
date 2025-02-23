import mongoose from "mongoose";

const PatientSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        phone: { type: String },
        dob: { type: Date },
        gender: { type: String },
        password: { type: String, required: true },
        location: { type: String }, // City, state, etc.
        profilePicture: { type: String }, // Cloudinary or similar storage URL
        illnesses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Illness" }], // List of illnesses
        groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }], // Groups the patient is part of
    },
    { timestamps: true }
);

export default mongoose.model("Patient", PatientSchema);
