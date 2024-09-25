
// import userSchema from '../model/userModel.mjs'


// // -------------------- check user is login or not  ------------------------

// async function isUser (req, res, next) {
//   try {
//     if (req.session.isUser) {
//       const userDetails = await userSchema.find({email:req.session.isUser})
//       if (userDetails && !userDetails.isBlocked) {
//         next()
//       } else {
//         req.session.isUser = ''
//         res.redirect('/login')
//       }
//     } else {
//       next()
//     }
//   } catch (err) {
//     console.log(`Error in user Middleware  ${err}`)
//   }
// }

// export default isUser
import userSchema from '../model/userModel.mjs'

// -------------------- check user is login or not  ------------------------

async function isUser(req, res, next) {
  try {
    if (req.session.isUser) {
      const userDetails = await userSchema.findOne({ email: req.session.isUser });

      if (userDetails && !userDetails.isBlocked && userDetails.isVerified) {
        next();
      } else {
        req.session.isUser = null; // Clear session value
        res.redirect('/user/login'); // Redirect to login
      }
    } else {
      res.redirect('/user/login'); // Redirect if no session value
    }
  } catch (err) {
    console.error(`Error in user Middleware: ${err}`);
    res.status(500).send('Internal Server Error'); // Send appropriate error response
  }
}

export default isUser;
