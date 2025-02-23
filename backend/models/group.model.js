const MentalGroupSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        description: { type: String },
        members: [{ type: mongoose.Schema.Types.ObjectId, ref: "Patient" }], // Patients & doctors
        posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    },
    { timestamps: true }
);

export default mongoose.model("MentalGroup", MentalGroupSchema);