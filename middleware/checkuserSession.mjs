
// import User from '../model/userModel.mjs'
// async function checkUser(req, res, next) {
//   try {
//     if (req.session.isUser) {
//       const userDetails = await User.findOne({ email: req.session.isUser });

//       if (userDetails && !userDetails.isBlocked && userDetails.isVerified) {
//         next()
//       } else {
//         req.session.isUser = null
//         return res.redirect('user/home')
//       }
//     } else {
//       next()
//     }
//   } catch (err) {
//     console.error(`Error in checkUser Middleware: ${err}`);
   
//     console.log(err)
//   }
// }

// export default checkUser;
import User from '../model/userModel.mjs';

async function checkUser(req, res, next) {
  try {
    if (req.session.isUser) {
      const userDetails = await User.findOne({ email: req.session.isUser });

      if (userDetails && !userDetails.isBlocked && userDetails.isVerified) {
        next(); // Continue to the next middleware
      } else {
        req.session.isUser = null; // Clear the correct session key
        return res.redirect('/user/home'); // Ensure proper URL structure and prevent further execution
      }
    } else {
      next(); // No user in session, proceed to the next middleware
    }
  } catch (err) {
    console.error(`Error in checkUser Middleware: ${err}`);
    res.status(500).send('Internal Server Error'); // Send an error response to the client
  }
}

export default checkUser;
