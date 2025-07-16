exports.registerUser = (req, res) => {
  res.status(200).json({ msg: 'Registration handled by Firebase' });
};

exports.loginUser = (req, res) => {
  res.status(200).json({ msg: 'Login handled by Firebase' });
};