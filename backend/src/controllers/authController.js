const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required. Set it in your .env file.');
}
const JWT_SECRET = process.env.JWT_SECRET;

exports.login = async (req, res) => {
  try {
    const { practice_hash, password } = req.body;
    
    // For this task, we'll look up the practice by hash.
    // In production, you would verify a hashed password.
    const practice = await prisma.practice.findUnique({
      where: { practiceHash: practice_hash }
    });

    // Get expected password from environment or use a secure mock for demo
    const DEMO_PASSWORD = process.env.DEMO_LOGIN_PASSWORD || 'demo-password-change-me';
    
    if (!practice) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // In production, verify against hashed password stored in database
    // For demo purposes, validate against configurable environment variable
    if (password !== DEMO_PASSWORD) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ practiceId: practice.id }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      token,
      practice_id: practice.id
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.refresh = async (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const newToken = jwt.sign({ practiceId: decoded.practiceId }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token: newToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
