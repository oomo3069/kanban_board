import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
//   console.log("🔥 Middleware authenticateJWT is running");

  const authHeader = req.headers.authorization;
//   console.log("📢 Authorization Header:", authHeader);
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    //   console.log("❌ Unauthorized - No Token Provided");
      res.status(403).json({ error: "❌ Unauthorized - No Token Provided" });
      return;
  }

  const token = authHeader.split(" ")[1];

  try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log("✅ Token Decoded:", decoded);
      (req as any).user = decoded;
      next();
  } catch (err) {
      console.log("❌ Invalid Token");
      res.status(403).json({ error: "❌ Unauthorized - Invalid Token" });
      return;
  }
};

