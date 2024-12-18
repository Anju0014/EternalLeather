
import User from '../../model/userModel.mjs'; 

export const adminuserget= async (req, res,next) => {
    try {
        const users = await User.find(); 
        res.render('adminUser', { message:users }); 
    } catch (error) {
        console.error('Error fetching users:', error);
        // res.status(500).send('Internal Server Error')
        next(error)
    }
};


export const adminuserpost= async (req, res,next) => {
    try{
    const { id } = req.params;
    const { blockStatus } = req.body; 
    const user = await User.findById(id);

    
    user.isBlocked = blockStatus === 'block' ? true: false;
    await user.save();
    if(blockStatus==='block'){
        req.session.isUser=null
    }
    res.redirect('/admin/user'); 
}catch (error) {
    console.error('Error toggling block status:', error);
    next(error)
}
};



export const adminusersearch=async(req,res)=>{
    try{
        const username=req.body.sename;
        if(username){
            const regex = new RegExp(username, 'i'); // 'i' for case-insensitive
            const user1 = await User.find({ name: { $regex: regex } });
            console.log(user1)
            if(user1.length>0){
               console.log("entered");
               res.render('adminUser',{
                   message: user1,
                   currentPage: 1,
                   totalPages: 1,
                });
            }else{
            res.redirect('/admin/user')
            }
        }else{
            res.redirect('/admin/user')
        }
    }catch(error){
        console.log(error.message)
        next(error)
    }
}