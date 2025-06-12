import connectDB from "@/lib/mongodb";

export default async function handler(req, res) {
  try {
    await connectDB();
    res.status(200).json({ message: "Database connected successfully!" });
  } catch (error) {
    console.error("DB connection error:", error);
    res
      .status(500)
      .json({ message: "Database connection failed.", error: error.message });
  }
}
