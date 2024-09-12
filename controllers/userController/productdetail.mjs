import Product from '../../model/productModel.mjs'


export const userproductdetail = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await Product.findById(id); // Use findById for a single document
        
        if (!product) {
            return res.status(404).send('Product not found');
        }

        console.log(product);
        const relateproduct= await Product.find({isDeleted:false}).limit(4).skip(4);
        console.log(relateproduct);
        res.render('userproductdetail', { product,relateproduct,sessionuser:req.session.isUser });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
};
