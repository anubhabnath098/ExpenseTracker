import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET_KEY;

export async function authMiddleware(req, res, next) {
  // Get the Authorization header
  const authHeader = req.headers.authorization;

  // Check if the header exists and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No token provided or invalid format." });
  }

  // Extract the token (remove "Bearer " prefix)
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access denied. Token missing after Bearer." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(400).json({ error: "Invalid token." });
  }
}

export async function adminMiddleware(req, res, next) {
  // Get the Authorization header
  const authHeader = req.headers.authorization;

  // Check if the header exists and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No token provided or invalid format." });
  }

  // Extract the token (remove "Bearer " prefix)
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access denied. Token missing after Bearer." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(400).json({ error: "Invalid token." });
  }
}