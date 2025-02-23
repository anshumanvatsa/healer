import mongoose from "mongoose";

const DoctorSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        phone: { type: String, required: true },
        dob: { type: Date },
        gender: { type: String },
        password: { type: String, required: true },
        location: { type: String }, // City, state, etc.
        profilePicture: { type: String }, // Cloudinary or similar storage URL
        specialization: { type: String, required: true },
        qualifications: { type: String },
        licenseNumber: { type: String, required: true }, // Medical license number
        experience: { type: Number }, // Years of experience
        hospital: { type: String }, // Clinic/hospital name
        consultationFee: { type: Number }, // Optional
        availableSlots: [{ type: Date }], // Available appointment slots
        certifications: [{ type: String }], // List of certifications
        hospitalAffiliation: { type: String, required: true }, // Associated hospital/clinic
        // groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }], // Groups the doctor is part of
        group: { type: String, enum: ["mental", "physical", "sexual", "counsellor"], required: true },
    },
    { timestamps: true }
);

export default mongoose.model("Doctor", DoctorSchema);
