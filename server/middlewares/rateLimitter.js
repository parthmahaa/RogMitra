import User from '../models/User.js';

const rateLimitMiddleware = async (req, res, next) => {
  if (req.isGuest) {

    /* ALLOW ONE REQ FROM GUEST*/
    if (!req.session.guestRequest) {
      req.session.guestRequest = true;
      return next();
    }
    return res.status(403).json({ message: 'Guest users are limited to one request. Please log in.' });
  }

  // For authenticated users
  const userId = req.user?._id;
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized: User not found.' });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized: User not found.' });
  }

  const today = new Date().setHours(0, 0, 0, 0);
  const lastRequestDate = user.lastRequestDate ? new Date(user.lastRequestDate).setHours(0, 0, 0, 0) : null;

  if (lastRequestDate !== today) {
    user.requestCount = 0;
    user.lastRequestDate = new Date();
  }

  if (user.requestCount >= 200) {
    return res.status(429).json({ message: 'Daily request limit reached (3 requests per day)' });
  }

  user.requestCount += 1;
  await user.save();
  next();
};

export default rateLimitMiddleware;