// Only logged-in customers
function requireCustomer(req, res, next) {
  if (req.session && req.session.customer) return next();
  return res.status(401).json({ error: 'Please login first.' });
}

// Only restaurant staff
function requireStaff(req, res, next) {
  if (req.session && req.session.isStaff) return next();
  return res.status(401).json({ error: 'Staff login required.' });
}

module.exports = { requireCustomer, requireStaff };
