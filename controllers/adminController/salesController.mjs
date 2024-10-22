import Order from '../../model/orderModel.mjs'
import Category from '../../model/categoryModel.mjs'
import User from '../../model/userModel.mjs'
import ExcelJS from 'exceljs'
import PDFDocument from 'pdfkit-table';
import moment from 'moment'

const getDateRange = (filter,customDate) => {
    const now = moment();
    let dateRange = {};
    
    if (filter === 'thisYear') {
        dateRange = {
            createdAt: {
                $gte: now.startOf('year').toDate(),
                $lte: now.endOf('year').toDate()
            }
        };
    } else if (filter === 'thisMonth') {
        dateRange = {
            createdAt: {
                $gte: now.startOf('month').toDate(),
                $lte: now.endOf('month').toDate()
            }
        };
    } else if (filter === 'thisWeek') {
        dateRange = {
            createdAt: {
                $gte: now.startOf('week').toDate(),
                $lte: now.endOf('week').toDate()
            }
        };
    }else if (filter === 'thisDay') {
        dateRange = {
            createdAt: {
                $gte: now.startOf('day').toDate(),   
                $lte: now.endOf('day').toDate()      
            }
        };
    } else if (filter === 'custom' && customDate) {
        dateRange = {
            createdAt: {
                $gte: moment(customDate).startOf('day').toDate(),  
                $lte: moment(customDate).endOf('day').toDate()      
            }
        };
    } 

    return dateRange;
};

// export const adminSales = async (req, res, next) => {
//     try {
//         const orderCount = await Order.countDocuments();
//         const productCollection = await Category.find({ isActive: true });
        
       
//         const filter = req.query.filter || 'all'; 
//         const customDate= req.query.customDate;
//         const dateRange = getDateRange(filter,customDate);
        
     
//         const revenueResult = await Order.aggregate([
//             { $match: { orderStatus: { $in: ['Shipped', 'Delivered'] }, ...dateRange } }, 
//             { $group: { _id: null, total: { $sum: "$totalPayablePrice" } } }
//         ]);
        
//         const Revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
        
       
//         const productCount = await Order.aggregate([
//             { $match: dateRange }, 
//             { $group: { _id: null, total: { $sum: "$totalQuantity" } } }
//         ]);
        
//         const shippedDeliveredOrders = await Order.find({
//             orderStatus: { $in: ['Shipped', 'Delivered'] },
//             ...dateRange 
//         });
        
//         const deliveredOrderCount = await Order.find({ orderStatus: 'Delivered', ...dateRange }).countDocuments();

//         res.render('adminSales', {
//             message: shippedDeliveredOrders,
//             light: req.flash(),
//             productCollection,
//             Revenue,
//             productCount: productCount[0]?.total || 0,
//             orderCount,
//             deliveredOrderCount
//         });
//     } catch (error) {
//         console.log(`Error while rendering sales report: ${error}`);
//         next(error)
       
//     }
// };


export const adminSales = async (req, res, next) => {
    try {
        const orderCount = await Order.countDocuments(); 
        const productCollection = await Category.find({ isActive: true });
        
        const filter = req.query.filter || 'all'; 
        const customDate = req.query.customDate;
        const dateRange = getDateRange(filter, customDate); 
        
       
        const revenueResult = await Order.aggregate([
            { 
                $match: {
                    paymentStatus: 'Paid' 
                }
            },
            { $unwind: "$products" }, 
            { 
                $match: {
                    "products.productstatus": { $in: ['Shipped', 'Delivered'] } 
                }
            },
            { 
                $group: { 
                    _id: null, 
                    total: { 
                      $sum: { 
                        $subtract: [
                            { $multiply: [ "$products.productprice", "$products.productquantity" ] },
                            { $ifNull: ["$products.couponDiscount", 0] } 
                        ]
                    }
                    } 
                } 
            }
        ]);

        const Revenue = revenueResult.length > 0 ? revenueResult[0].total : 0; 
        
        
        const productCount = await Order.aggregate([
            { $unwind: "$products" }, 
            { 
                $match: {
                    "products.productstatus": { $in: ['Shipped', 'Delivered'] }, 
                    ...dateRange 
                }
            },
            { 
                $group: { 
                    _id: null, 
                    total: { $sum: "$products.productquantity" } 
                } 
            }
        ]);

        
        const shippedDeliveredProducts = await Order.aggregate([
            { $unwind: "$products" }, 
            { 
                $match: {
                    "products.productstatus": { $in: ['Shipped', 'Delivered'] }, 
                    ...dateRange 
                }
            },
            {
                $project: {
                    _id: 0,
                    orderId: "$orderId", 
                    customerName: "$address.customerName", 
                    productName: "$products.productname", 
                    productQuantity: "$products.productquantity", 
                    productPrice: "$products.productprice", 
                    productStatus: "$products.productstatus", 
                    productImage: "$products.productimage", 
                    productOrderId: "$products.productOrderId" 
                }
            }
        ]);
        
       
        const deliveredProductCountx = await Order.aggregate([
            { $unwind: "$products" }, 
            { 
                $match: {
                    "products.productstatus": 'Delivered', 
                    ...dateRange 
                }
            }
        ]) 
        const deliveredProductCount=deliveredProductCountx.length
        console.log(deliveredProductCount)
        console.log("heeeloooooooocixicdvubju")

        res.render('adminSales', {
            products: shippedDeliveredProducts, 
            light: req.flash(),
            productCollection,
            Revenue,
            productCount: productCount[0]?.total || 0, 
            orderCount,
            deliveredProductCount 
        });
    } catch (error) {
        console.log(`Error while rendering sales report: ${error}`);
        next(error);
    }
};



// export const downloadSalesExcel = async (req, res,next) => {
//     try {
       
//         const filter = req.query.filter || 'all'; 
        
//         const customDate= req.query.customDate;
//         const dateRange = getDateRange(filter,customDate);
        
//         // const dateRange = getDateRange(filter);

      
//         const orders = await Order.find({
//             orderStatus: { $in: ['Shipped', 'Delivered'] },
//             ...dateRange 
//         });

//         const workbook = new ExcelJS.Workbook();
//         const worksheet = workbook.addWorksheet('Sales Report');

//         worksheet.columns = [
//             { header: 'Order ID', key: 'orderId', width: 30 },
//             { header: 'Customer', key: 'customerName', width: 30 },
//             { header: 'Products', key: 'products', width: 30 }, 
//             { header: 'Total Quantity', key: 'totalQuantity', width: 20 },
//             {header:'Discount',key:'discountApplied',width:10},
//             { header: 'Status', key: 'orderStatus', width: 15 },
           
//         ];

//         for (const order of orders) {
//             const customer = await User.findById(order.customerId); 
//             const customerName = customer ? customer.name : 'Unknown';

         
//             const productDetails = order.products.map(product => `${product.productname} (Qty: ${product.productquantity})`).join('\n');

           
//             worksheet.addRow({
//                 orderId: order.orderId,
//                 customerName: customerName,
//                 products: productDetails,
//                 totalQuantity: order.totalQuantity,
//                 discountApplied:order.discountApplied,
//                 orderStatus: order.orderStatus,
               
//             });
//         }

//         worksheet.getColumn('products').alignment = { wrapText: true };
//         res.setHeader(
//             'Content-Type',
//             'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
//         );
//         res.setHeader(
//             'Content-Disposition',
//             'attachment; filename=sales_report.xlsx'
//         );

//         await workbook.xlsx.write(res);
//         res.end();
//     } catch (error) {
//         console.log(`Error generating Excel file: ${error}`);
//         // res.status(500).send('Error generating Excel file');
//         next(error)
//     }
// };





export const downloadSalesExcel = async (req, res, next) => {
    try {
        const filter = req.query.filter || 'all'; 
        const customDate = req.query.customDate;
        const dateRange = getDateRange(filter, customDate); 

        const shippedDeliveredProducts = await Order.aggregate([
            { $unwind: "$products" }, 
            { 
                $match: {
                    "products.productstatus": { $in: ['Shipped', 'Delivered'] },
                    ...dateRange
                }
            },
            {
                $project: {
                    orderId: "$orderId",
                    customerName: "$address.customerName",
                    productName: "$products.productname",
                    productQuantity: "$products.productquantity",
                    productPrice: "$products.productprice",
                    productStatus: "$products.productstatus",
                    discountApplied: "$discountApplied",
                    orderQuantityCount: "$totalQuantity",
                }
            }
        ]);

        
        console.log('Shipped/Delivered Products:', shippedDeliveredProducts);

        let grandTotalAmount = 0;
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        
        worksheet.mergeCells('A1:G1'); 
        const headingCell = worksheet.getCell('A1');
        headingCell.value = 'Pelle Eterno'; 
        headingCell.font = { size: 16, bold: true }; 
        headingCell.alignment = { vertical: 'middle', horizontal: 'center' }; 

        worksheet.addRow(); 

        const headerRow = worksheet.addRow([
            'Order ID', 
            'Customer', 
            'Product Name', 
            'Quantity', 
            'Price', 
            'Discount', 
            'Status'
        ]);

        
        headerRow.font = { size: 12, bold: true }; 
        headerRow.eachCell(cell => {
            cell.alignment = { horizontal: 'center' };
        });

        
        shippedDeliveredProducts.forEach(order => {
            
            console.log('Processing Order:', order);

            const productValue = order.productPrice * order.productQuantity;

            
            const individualDiscount = (order.discountApplied * order.productQuantity) / order.orderQuantityCount;

            const finalProductPrice = productValue - individualDiscount;

            
            const row = worksheet.addRow([
                order.orderId,
                order.customerName,
                order.productName,
                order.productQuantity,
                order.productPrice,
                individualDiscount, 
                order.productStatus,
            ]);

            
            row.eachCell(cell => {
                cell.alignment = { horizontal: 'left' }; 
            });

            grandTotalAmount += finalProductPrice;
        });

        
        const totalRow = worksheet.addRow([
            '',  
            '',  
            '',  
            '',  
            '',  
            `Total Amount: Rs.${grandTotalAmount.toFixed(2)}`,  
            '',  
        ]);

        
        worksheet.mergeCells(totalRow.number, 6, totalRow.number, 7); 

        
        worksheet.getCell(`F${totalRow.number}`).alignment = { vertical: 'middle', horizontal: 'center' };

        
        worksheet.getColumn('C').alignment = { wrapText: true }; 

        
        worksheet.columns.forEach(column => {
            column.width = 20; 
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=sales_report.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error(`Error generating Excel file: ${error}`);
        next(error);
    }
};







// export const downloadSalesPdf = async (req, res, next) => {
//     try {
      
//         const filter = req.query.filter || 'all'; 

//         const customDate= req.query.customDate;
//         const dateRange = getDateRange(filter,customDate);
        
//         // const dateRange = getDateRange(filter);

     
//         const orders = await Order.find({
//             orderStatus: { $in: ['Shipped', 'Delivered'] },
//             ...dateRange
//         });

//         const doc = new PDFDocument();
//         res.setHeader('Content-Disposition', 'attachment; filename=sales_report.pdf');
//         res.setHeader('Content-Type', 'application/pdf');

      
//         const table = {
//             headers: ['Order ID', 'Customer', 'Products', 'Total Quantity', 'Discount','Status'],
//             rows: []
//         };

       
//         for (const order of orders) {
//             const customer = await User.findById(order.customerId); 
//             const customerName = customer ? customer.name : 'Unknown';

           
            // const productDetails = order.products.map(product => `${product.productname} (Qty: ${product.productquantity})`).join('\n ');

  
//             table.rows.push([
//                 order.orderId,
//                 customerName,
//                 productDetails,
//                 order.totalQuantity,
//                 order.discountApplied,
//                 order.orderStatus
//             ]);
//         }

//         doc.table(table, { width: 500 });

      
//         doc.pipe(res);
//         doc.end();
//     } catch (error) {
//         console.log(`Error generating PDF: ${error}`);
//         next(error)
//         // res.status(500).send('Error generating PDF');
//     }
// };



//





export const downloadSalesPdf = async (req, res, next) => {
    try {
        const filter = req.query.filter || 'all'; 
        const customDate = req.query.customDate;
        const dateRange = getDateRange(filter, customDate); 
        
        const shippedDeliveredProducts = await Order.aggregate([
            { $unwind: "$products" }, 
            { 
                $match: {
                    "products.productstatus": { $in: ['Shipped', 'Delivered'] },
                    ...dateRange 
                }
            },
            {
                $project: {
                    orderId: "$orderId",
                    customerName: "$address.customerName",
                    productName: "$products.productname",
                    productQuantity: "$products.productquantity",
                    productPrice: "$products.productprice",
                    productStatus: "$products.productstatus",
                    discountApplied: "$discountApplied",
                    orderQuantityCount:"$totalQuantity",
                    
                }
            }
        ]);

        let grandTotalAmount = 0;


        const doc = new PDFDocument({ margin: 30 });
        
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=product_sales_report.pdf');
        
        
        doc.fontSize(20).text('Pelle Eterno - Product Sales Report', { align: 'center' });
        doc.moveDown();

        const table = {
            headers: ['Order ID', 'Customer', 'Product Name', 'Quantity', 'Price', 'Individual Discount', 'Status'],
            rows: []
        };

        
        const totalOrderValue = shippedDeliveredProducts.reduce((total, order) => {
            return total + (order.productPrice * order.productQuantity);
        }, 0);

        
        shippedDeliveredProducts.forEach(order => {
            const productValue = order.productPrice * order.productQuantity;

        
            const individualDiscount = (order.discountApplied * order.productQuantity) /order.orderQuantityCount;

    
            const finalProductPrice = productValue - individualDiscount;

            
            table.rows.push([
                order.orderId,
                order.customerName,
                order.productName,
                order.productQuantity,
                `Rs.${order.productPrice.toFixed(2)}`,
                `Rs.${individualDiscount.toFixed(2)}`,  
                order.productStatus
            ]);

            
            grandTotalAmount += finalProductPrice;
        });


        table.rows.push([
                        '', '', '', '', '', 'Total Amount:', `Rs.${grandTotalAmount.toFixed(2)}` 
                    ]);

        
        doc.table(table, { width: 500 });

        
        // doc.moveDown();
        // doc.fontSize(14).text(`Total Amount: $${grandTotalAmount.toFixed(2)}`, { align: 'right' });

        
        doc.pipe(res);
        doc.end();

    } catch (error) {
        console.error(`Error generating product sales PDF: ${error}`);
        next(error);
    }
};
