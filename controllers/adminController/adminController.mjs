import bcrypt from "bcrypt";

const adminEmail = "anjum1495pkr@gmail.com";
const adminPassword = "anjuanju";


export const admin = async (req, res) => {
  try {
    res.redirect("/admin/login");
  } catch (error) {
    console.log(`error from admin ${error}`);
  }
};

export const adminlogin = async (req, res) => {
  try {
    if (req.session.isAdmin) {
      res.redirect("/admin/home");
    } else {
      res.render("adminlogin", { message: req.flash() });
    }
  } catch (error) {
    console.log(`error from admin login ${error}`);
  }
};

export const adminverify = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    if (email === adminEmail) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      const passwordMatch = await bcrypt.compare(password, passwordHash);

      if (passwordMatch) {
        // req.session.isAdmin = true;
        req.session.isAdmin = req.body.email;
        res.redirect("/admin/home");
      } else {
        req.flash("error", "Invalid Username or Password");
        res.redirect("/admin/login");
        //res.render('adminlogin',{message:"Invalid Username or Password"});
      }
    } else {
      req.flash("error", "Invalid Username or Password");
      res.redirect("/admin/login");
    }
  } catch (error) {
    console.log(`error from admin verification ${error}`);
  }
};

export const adminhome = async (req, res) => {
  try {
    if (!req.session.isAdmin) {
      return res.redirect("/admin");
    }
    res.render("adminDashboard");
  } catch (error) {
    console.log(`error from admin home ${error}`);
  }
};

export const adminlogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/admin/login");
  } catch (error) {
    console.log(error.message);
  }
};
