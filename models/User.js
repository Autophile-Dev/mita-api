const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, default: "" },
  last_session_id: { type: String },
  otp_verified: { type: Boolean, default: false },
});

export default mongoose.models.User || mongoose.model("User", userSchema);
