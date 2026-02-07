import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    clerkUserId: { type: String, required: true, unique: true, index: true },

    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    role: { type: String, enum: ["buyer", "seller"], required: true },

    trustScore: { type: Number, default: 0 }, // float
    carbonFootprint: { type: Number, default: 0 }, // float (big float)
    pathToZeroScore: { type: Number, default: 0 }, // integer
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);


