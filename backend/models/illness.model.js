const IllnessSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        description: { type: String },
        group: { type: mongoose.Schema.Types.ObjectId, ref: "Group" }, // Linked illness group
    },
    { timestamps: true }
);

export default mongoose.model("Illness", IllnessSchema);
