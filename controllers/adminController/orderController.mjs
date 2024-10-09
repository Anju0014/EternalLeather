import Order from '../../model/orderModel.mjs'

import User from '../../model/userModel.mjs'


export const adminorders= async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = 10;
        const skip = (page - 1) * pageSize;
        const orders = await Order.find().populate('customerId', 'name email').populate('products.productId');
       

        const totalorders = await Order.countDocuments();
        const totalPages = Math.ceil(totalorders / pageSize);
       
        res.render('adminOrders', {
            message:orders,
            currentPage:page,
            totalPages:totalPages,
            light:req.flash()
        });
    } catch (error) {
        console.log('Error fetching orders:', error);
    //     console.log(error)
    //     res.status(500).json({ success: false, message: 'Internal server error' });
    // 
    next(error)
    }
 
};

// Delete Category
export const adminorderCancel = async (req, res) => {
    try {
        // const categoryId = req.query.id;
        // console.log(req.query.id);

        // const category = await Category.findByIdAndDelete(categoryId);
        // console.log(category)

        // // if (!category) {
        // //     req.flash("error", "Category not found");
        // //     return res.redirect('/admin/category');
        // // }

        // req.flash("success", "Category deleted successfully");
        // res.redirect('/admin/category');
        console.log(req.url)
    const order = await Order.findByIdAndUpdate(req.query.id,{
        isCancelled: true,
        //deletedAt: new Date(),
      });
    res.redirect('/admin/order')

    } catch (error) {
        console.log(`Error deleting product: ${error}`);
        // req.flash("error", "An error occurred while cancelling the order");
        // res.redirect('/admin/order');
        next(error)
    }
   
};
export const adminorderupdate= async (req, res) => {
    try{
    const { id } = req.params;
    const { orderStatus } = req.body; 
    const order = await Order.findById(id);

    if (!order) {
    //     return res.status(404).send('User not found');
    res.redirect('/admin/order')
    }

    
    order.orderStatus = orderStatus
    if(orderStatus==="Cancelled"){
       order.isCancelled=true
    }else {
        order.isCancelled = false;
    }
    if(orderStatus==="Delivered"){
        order.deliveredDate= Date.now();
    }
    if(orderStatus==="Returned"){
        order.returnedDate=Date.now();
    }
    await order.save();

    res.redirect('/admin/order'); 
}catch (error) {
    console.error('Error toggling block status:', error);
    // res.status(500).send('Internal Server Error');
    next(error)
}
}
