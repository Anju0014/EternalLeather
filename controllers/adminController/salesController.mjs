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
        // Assuming customDate is provided in a valid date format
        dateRange = {
            createdAt: {
                $gte: moment(customDate).startOf('day').toDate(),  // Start of the custom day
                $lte: moment(customDate).endOf('day').toDate()      // End of the custom day
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
//             { $match: { orderStatus: { $in: ['Shipped', 'Delivered'] }, ...dateRange } }, // Apply the date range
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
        const orderCount = await Order.countDocuments(); // Total number of orders
        const productCollection = await Category.find({ isActive: true }); // Active product categories
        
        const filter = req.query.filter || 'all'; 
        const customDate = req.query.customDate;
        const dateRange = getDateRange(filter, customDate); // Get date range based on the filter
        
        // Aggregate to find revenue from shipped and delivered products
        const revenueResult = await Order.aggregate([
            { $unwind: "$products" }, // Deconstruct products array
            { 
                $match: {
                    "products.productstatus": { $in: ['Shipped', 'Delivered'] }, // Filter by product status
                    ...dateRange // Apply date range
                }
            },
            { 
                $group: { 
                    _id: null, 
                    total: { $sum: "$products.productprice" } // Calculate total price from products
                } 
            }
        ]);

        const Revenue = revenueResult.length > 0 ? revenueResult[0].total : 0; // Total revenue
        
        // Aggregate product count for products with specific status
        const productCount = await Order.aggregate([
            { $unwind: "$products" }, // Deconstruct products array
            { 
                $match: {
                    "products.productstatus": { $in: ['Shipped', 'Delivered'] }, // Filter by product status
                    ...dateRange // Apply date range
                }
            },
            { 
                $group: { 
                    _id: null, 
                    total: { $sum: "$products.productquantity" } // Calculate total quantity
                } 
            }
        ]);

        // Fetch products with status 'Shipped' or 'Delivered'
        const shippedDeliveredProducts = await Order.aggregate([
            { $unwind: "$products" }, // Deconstruct products array
            { 
                $match: {
                    "products.productstatus": { $in: ['Shipped', 'Delivered'] }, // Filter by product status
                    ...dateRange // Apply date range
                }
            },
            {
                $project: {
                    _id: 0,
                    orderId: "$orderId", // Include order ID
                    customerName: "$address.customerName", // Include customer's name
                    productName: "$products.productname", // Include product name
                    productQuantity: "$products.productquantity", // Include product quantity
                    productPrice: "$products.productprice", // Include product price
                    productStatus: "$products.productstatus", // Include product status
                    productImage: "$products.productimage", // Include product image
                    productOrderId: "$products.productOrderId" // Include specific product order ID
                }
            }
        ]);
        
        // Count of delivered products based on product status
        const deliveredProductCount = await Order.aggregate([
            { $unwind: "$products" }, // Deconstruct products array
            { 
                $match: {
                    "products.productstatus": 'Delivered', // Match products that are delivered
                    ...dateRange // Apply date range
                }
            }
        ]).length; // Count the number of delivered products

        res.render('adminSales', {
            products: shippedDeliveredProducts, // Pass the product details to the view
            light: req.flash(),
            productCollection,
            Revenue,
            productCount: productCount[0]?.total || 0, // Total quantity of products
            orderCount,
            deliveredProductCount // Count of delivered products
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








// export const downloadSalesExcel = async (req, res, next) => {
//     try {
//         const filter = req.query.filter || 'all'; 
//         const customDate = req.query.customDate;
//         const dateRange = getDateRange(filter, customDate); 

//         const shippedDeliveredProducts = await Order.aggregate([
//             { $unwind: "$products" }, 
//             { 
//                 $match: {
//                     "products.productstatus": { $in: ['Shipped', 'Delivered'] },
//                     ...dateRange
//                 }
//             },
//             {
//                 $project: {
//                     orderId: "$orderId",
//                     customerName: "$address.customerName",
//                     productName: "$products.productname",
//                     productQuantity: "$products.productquantity",
//                     productPrice: "$products.productprice",
//                     productStatus: "$products.productstatus",
//                     discountApplied: "$discountApplied",
//                     orderQuantityCount:"$totalQuantity",
//                 }
//             }
//         ]);

//         let grandTotalAmount = 0;
//         const workbook = new ExcelJS.Workbook();
//         const worksheet = workbook.addWorksheet('Sales Report');

//         // worksheet.mergeCells('A1:G1'); // Merge cells for the heading
//         // const headingCell = worksheet.getCell('A1');
//         // headingCell.value = 'Pelle Eterno'; // Set heading text
//         // headingCell.font = { size: 16, bold: true }; // Set font size and make it bold
//         // headingCell.alignment = { vertical: 'middle', horizontal: 'center' }; // Center alignment for heading

//         // worksheet.addRow(); // Add a blank row after the heading


//         worksheet.columns = [
//             { header: 'Order ID', key: 'orderId', width: 30 },
//             { header: 'Customer', key: 'customerName', width: 30 },
//             { header: 'Product Name', key: 'productName', width: 30 },
//             { header: 'Quantity', key: 'productQuantity', width: 20 },
//             { header: 'Price', key: 'productPrice', width: 20 },
//             { header: 'Discount', key: 'discountApplied', width: 10 },
//             { header: 'Status', key: 'productStatus', width: 15 },
//         ];

//         const totalOrderValue = shippedDeliveredProducts.reduce((total, order) => {
//             return total + (order.productPrice * order.productQuantity);
//         }, 0);

//            shippedDeliveredProducts.forEach(order => {
//             const productValue = order.productPrice * order.productQuantity;

//             // Calculate the individual discount for the product
//             const individualDiscount = (order.discountApplied * order.productQuantity) /order.orderQuantityCount;

//             // Calculate final price after discount for this product
//             const finalProductPrice = productValue - individualDiscount;

//             worksheet.addRow({
//                 orderId: order.orderId,
//                 customerName: order.customerName,
//                 productName: order.productName,
//                 productQuantity: order.productQuantity,
//                 productPrice: order.productPrice,
//                 discountApplied: individualDiscount, // Use calculated individual discount
//                 productStatus: order.productStatus,
//             });

//             grandTotalAmount += finalProductPrice;
//         });

//         // Add a new row for the total amount
//         const totalRow = worksheet.addRow([
//             '',  // Empty cell for Order ID
//             '',  // Empty cell for Customer
//             '',  // Empty cell for Product Name
//             '',  // Empty cell for Quantity
//             '',  // Empty cell for Price
//             `Total Amount: Rs.${grandTotalAmount.toFixed(2)}`,  // Total amount
//             '',  // Empty cell for Status
//         ]);

//         // Merge cells for the total amount
//         worksheet.mergeCells(totalRow.number, 6, totalRow.number, 7); // Merge last two columns (Discount and Status)

//         // Set alignment for merged cell to center
//         worksheet.getCell(`F${totalRow.number}`).alignment = { vertical: 'middle', horizontal: 'center' };

//         // Set cell alignment for specific columns if needed
//         worksheet.getColumn('productName').alignment = { wrapText: true }; // Example to set alignment for 'productName'

//         res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//         res.setHeader('Content-Disposition', 'attachment; filename=sales_report.xlsx');

//         await workbook.xlsx.write(res);
//         res.end();
//     } catch (error) {
//         console.error(`Error generating Excel file: ${error}`);
//         next(error);
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

        // Debugging: Check the retrieved products
        console.log('Shipped/Delivered Products:', shippedDeliveredProducts);

        let grandTotalAmount = 0;
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        // Add a heading for the report
        worksheet.mergeCells('A1:G1'); // Merge cells for the heading
        const headingCell = worksheet.getCell('A1');
        headingCell.value = 'Pelle Eterno'; // Set heading text
        headingCell.font = { size: 16, bold: true }; // Set font size and make it bold
        headingCell.alignment = { vertical: 'middle', horizontal: 'center' }; // Center alignment for heading

        worksheet.addRow(); // Add a blank row after the heading

        // Define headers in the next row (row 3)
        const headerRow = worksheet.addRow([
            'Order ID', 
            'Customer', 
            'Product Name', 
            'Quantity', 
            'Price', 
            'Discount', 
            'Status'
        ]);

        // Adjust header font size and style
        headerRow.font = { size: 12, bold: true }; // Set header font size and bold
        headerRow.eachCell(cell => {
            cell.alignment = { horizontal: 'center' }; // Center alignment for headers
        });

        // Iterate through products and add to worksheet
        shippedDeliveredProducts.forEach(order => {
            // Debugging: Check individual order details
            console.log('Processing Order:', order);

            const productValue = order.productPrice * order.productQuantity;

            // Calculate the individual discount for the product
            const individualDiscount = (order.discountApplied * order.productQuantity) / order.orderQuantityCount;

            // Calculate final price after discount for this product
            const finalProductPrice = productValue - individualDiscount;

            // Adding the row for the current product
            const row = worksheet.addRow([
                order.orderId,
                order.customerName,
                order.productName,
                order.productQuantity,
                order.productPrice,
                individualDiscount, // Use calculated individual discount
                order.productStatus,
            ]);

            // Optional: Set alignment or styling for the row cells if needed
            row.eachCell(cell => {
                cell.alignment = { horizontal: 'left' }; // Left alignment for values
            });

            grandTotalAmount += finalProductPrice;
        });

        // Add a new row for the total amount
        const totalRow = worksheet.addRow([
            '',  // Empty cell for Order ID
            '',  // Empty cell for Customer
            '',  // Empty cell for Product Name
            '',  // Empty cell for Quantity
            '',  // Empty cell for Price
            `Total Amount: Rs.${grandTotalAmount.toFixed(2)}`,  // Total amount
            '',  // Empty cell for Status
        ]);

        // Merge cells for the total amount
        worksheet.mergeCells(totalRow.number, 6, totalRow.number, 7); // Merge last two columns (Discount and Status)

        // Set alignment for merged cell to center
        worksheet.getCell(`F${totalRow.number}`).alignment = { vertical: 'middle', horizontal: 'center' };

        // Set cell alignment for specific columns if needed
        worksheet.getColumn('C').alignment = { wrapText: true }; // Example to set alignment for 'productName'

        // Set the width of the columns for better visibility
        worksheet.columns.forEach(column => {
            column.width = 20; // Set all columns to a width of 20 for better readability
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
        
        // Get the orders with 'Shipped' or 'Delivered' status
        const shippedDeliveredProducts = await Order.aggregate([
            { $unwind: "$products" }, 
            { 
                $match: {
                    "products.productstatus": { $in: ['Shipped', 'Delivered'] },
                    ...dateRange // Apply date range filter
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
                     // Common discount for the order
                }
            }
        ]);

        // Initialize total amounts
        let grandTotalAmount = 0;

        // Create a new PDF document
        const doc = new PDFDocument({ margin: 30 });
        
        // Set headers for PDF response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=product_sales_report.pdf');
        
        // Title and headers
        doc.fontSize(20).text('Pelle Eterno - Product Sales Report', { align: 'center' });
        doc.moveDown();

        const table = {
            headers: ['Order ID', 'Customer', 'Product Name', 'Quantity', 'Price', 'Individual Discount', 'Status'],
            rows: []
        };

        // Calculate total order value first
        const totalOrderValue = shippedDeliveredProducts.reduce((total, order) => {
            return total + (order.productPrice * order.productQuantity);
        }, 0);

        // Add product details to the table
        shippedDeliveredProducts.forEach(order => {
            const productValue = order.productPrice * order.productQuantity;

            // Calculate the individual discount for the product
            const individualDiscount = (order.discountApplied * order.productQuantity) /order.orderQuantityCount;

            // Calculate final price after discount for this product
            const finalProductPrice = productValue - individualDiscount;

            // Add to the table
            table.rows.push([
                order.orderId,
                order.customerName,
                order.productName,
                order.productQuantity,
                `$${order.productPrice.toFixed(2)}`,
                `$${individualDiscount.toFixed(2)}`,  // Individual discount for the product
                order.productStatus
            ]);

            // Update the grand total with the final product price
            grandTotalAmount += finalProductPrice;
        });


        table.rows.push([
                        '', '', '', '', '', 'Total Amount:', `$${grandTotalAmount.toFixed(2)}` // Leave other columns blank
                    ]);

        // Add the table to the PDF
        doc.table(table, { width: 500 });

        // Add the total amount at the end of the table
        // doc.moveDown();
        // doc.fontSize(14).text(`Total Amount: $${grandTotalAmount.toFixed(2)}`, { align: 'right' });

        // Finalize the PDF
        doc.pipe(res);
        doc.end();

    } catch (error) {
        console.error(`Error generating product sales PDF: ${error}`);
        next(error);
    }
};
