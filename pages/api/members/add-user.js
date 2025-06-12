import connectDB from "@/lib/mongodb";
import User from "@/models/User";
export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { name, phone, email, password, last_session_id } = req.body;

    if (!name || !phone || !email) {
      return res
        .status(400)
        .json({ message: "Name, phone, and email are required." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User already exists with this email." });
    }

    const newUser = new User({
      name,
      phone,
      email,
      password,
      last_session_id,
    });

    const savedUser = await newUser.save();

    res
      .status(201)
      .json({ message: "User added successfully", user: savedUser });
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
