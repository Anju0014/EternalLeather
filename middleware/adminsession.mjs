function isAdmin(req,res,next){
    if(req.session.isAdmin){
        next();
    }else{
        res.redirect('/admin/login')
    }
}
export default isAdmin