import jwt from "jsonwebtoken";
import Cookies from 'js-cookie';
const generateTokenAndSetCookie = (userId, res) => {
	const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
		expiresIn: "15d",
	});
console.log(token);

	Cookies.set("jwt",token);
	// res.cookie("jwt", token, {
	// 	httpOnly: true, // more secure
	// 	maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
	// 	sameSite: "strict", // CSRF
	// });

	return token;
};

export default generateTokenAndSetCookie;