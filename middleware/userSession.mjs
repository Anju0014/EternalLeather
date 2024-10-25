
import userSchema from '../model/userModel.mjs'



async function isUser(req, res, next) {
  try {
    if (req.session.isUser) {
      const userDetails = await userSchema.findOne({ email: req.session.isUser });

      if (userDetails && !userDetails.isBlocked && userDetails.isVerified) {
        next();
      } else {
        req.session.isUser = null; 
        res.redirect('/user/login'); 
      }
    } else {
      res.redirect('/user/login'); 
    }
  } catch (err) {
    console.error(`Error in user Middleware: ${err}`);
    res.status(500).send('Internal Server Error'); 
  }
}

export default isUser;
