// Auth controller placeholder
const authService = require("../services/auth.service");

const register = async (req, res) => {
  try {
    const { username, password } = req.body;
    const token = await authService.register(username, password);
    res.status(201).json({ token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const token = await authService.login(username, password);
    res.status(200).json({ token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
};