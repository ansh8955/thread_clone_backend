import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

const protectRoute = async (req, res, next) => {
  try {
	console.log(req.headers['authorization']+" "+"Aniket");
	console.log(req.headers.token+" "+"Abhishek");
	
    const token =  req.headers.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized, token missing" });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ message: "Token expired" });
        } else {
          return res.status(401).json({ message: "Unauthorized, invalid token" });
        }
      }

      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      req.user = user;
      next();
    });
  } catch (err) {
    console.log("Error in protectRoute: ", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default protectRoute;
