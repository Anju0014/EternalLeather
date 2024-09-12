
import userSchema from '../model/userModel.mjs'


// -------------------- check user is login or not  ------------------------

async function isUser (req, res, next) {
  try {
    if (req.session.isUser) {
      const userDetails = await userSchema.find({email:req.session.isUser})
      if (userDetails && !userDetails.isBlocked) {
        next()
      } else {
        req.session.isUser = ''
        res.redirect('/login')
      }
    } else {
      next()
    }
  } catch (err) {
    console.log(`Error in user Middleware  ${err}`)
  }
}

export default isUser
