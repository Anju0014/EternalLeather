
import User from '../model/userModel.mjs';

async function checkUser(req, res, next) {
  try {
    if (req.session.isUser) {
      const userDetails = await User.findOne({ email: req.session.isUser });

      if (userDetails && !userDetails.isBlocked && userDetails.isVerified) {
        next(); 
      } else {
        req.session.isUser = null; 
        return res.redirect('/user/home'); 
      }
    } else {
      next(); 
    }
  } catch (err) {
    console.error(`Error in checkUser Middleware: ${err}`);
    res.status(500).send('Internal Server Error'); 
  }
}

export default checkUser;
