import Order from '../../model/orderModel.mjs'
import Category from '../../model/categoryModel.mjs'
import User from '../../model/userModel.mjs'
import ExcelJS from 'exceljs'
import PDFDocument from 'pdfkit-table';
import moment from 'moment'

const getDateRange = (filter) => {
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
    }

    return dateRange;
};
// export const adminSales = async (req, res) => {
//     try {
//         const { filter } = req.query; // Assuming filter is passed as query param
//         const dateRange = getDateRange(filter);

//         const orderCount = await Order.countDocuments(dateRange);
//         const productCollection=await Category.find({isActive:true});
//         const revenueResult = await Order.aggregate([
//             { $match: { orderStatus: { $in: ['Shipped', 'Delivered'] } } },
//             { $group: { _id: null, total: { $sum: "$totalPayablePrice" } } }
//         ]);
//         const Revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
//         const productCount = await Order.aggregate([
//             { $group: { _id: null, total: { $sum: "$totalQuantity" } } }
//         ]);

//         const shippedDeliveredOrders = await Order.find({
//             orderStatus: { $in: ['Shipped', 'Delivered'] }
//         });
//         const deliveredOrderCount=await Order.find({orderStatus:'Delivered'}).countDocuments();

//         res.render('adminSales', {
//             message:shippedDeliveredOrders,
//             light:req.flash(),
//             productCollection,
//             Revenue,
//             productCount: productCount[0]?.total || 0,
//             orderCount,
//             deliveredOrderCount
//         });
//     } catch (error) {
//         console.log(`Error while rendering sales report: ${error}`);
//         res.status(500).send('Error rendering sales report');
//     }
// };
// Adjust the import path accordingly

// export const adminSales = async (req, res) => {
//     try {
//         // const { filter } = req.query; // Assuming filter is passed as query param
//         // const dateRange = getDateRange(filter);

//         // Fetch data based on the selected filter
//         const orderCount = await Order.countDocuments(dateRange);
//         const productCollection = await Category.find({ isActive: true });

//         const revenueResult = await Order.aggregate([
//             { $match: { ...dateRange, orderStatus: { $in: ['Shipped', 'Delivered'] } } },
//             { $group: { _id: null, total: { $sum: "$totalPayablePrice" } } }
//         ]);
//         const Revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

//         const productCount = await Order.aggregate([
//             { $match: dateRange },
//             { $group: { _id: null, total: { $sum: "$totalQuantity" } } }
//         ]);

//         const shippedDeliveredOrders = await Order.find({
//             ...dateRange,
//             orderStatus: { $in: ['Shipped', 'Delivered'] }
//         });

//         const deliveredOrderCount = await Order.find({
//             ...dateRange,
//             orderStatus: 'Delivered'
//         }).countDocuments();

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
//         res.status(500).send('Error rendering sales report');
//     }
// };

// 


export const adminSales = async (req, res) => {
    try {
        const orderCount = await Order.countDocuments();
        const productCollection = await Category.find({ isActive: true });
        
        // Get the filter from the request query
        const filter = req.query.filter || 'all'; // Default to 'all' if no filter is provided
        
        // Use the getDateRange function to get the date range based on the filter
        const dateRange = getDateRange(filter);
        
        // Modify revenue query to consider dateRange
        const revenueResult = await Order.aggregate([
            { $match: { orderStatus: { $in: ['Shipped', 'Delivered'] }, ...dateRange } }, // Apply the date range
            { $group: { _id: null, total: { $sum: "$totalPayablePrice" } } }
        ]);
        
        const Revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
        
        // Count products sold within the date range
        const productCount = await Order.aggregate([
            { $match: dateRange }, // Apply date range
            { $group: { _id: null, total: { $sum: "$totalQuantity" } } }
        ]);
        
        const shippedDeliveredOrders = await Order.find({
            orderStatus: { $in: ['Shipped', 'Delivered'] },
            ...dateRange // Apply the date range
        });
        
        const deliveredOrderCount = await Order.find({ orderStatus: 'Delivered', ...dateRange }).countDocuments();

        res.render('adminSales', {
            message: shippedDeliveredOrders,
            light: req.flash(),
            productCollection,
            Revenue,
            productCount: productCount[0]?.total || 0,
            orderCount,
            deliveredOrderCount
        });
    } catch (error) {
        console.log(`Error while rendering sales report: ${error}`);
        res.status(500).send('Error rendering sales report');
    }
};


// export const downloadSalesExcel = async (req, res) => {
//     try {
//         const { filter } = req.query;  // Get the filter from query params
//         const dateRange = getDateRange(filter);  // Get the date range for the filter

//         const orders = await Order.find({
//             ...dateRange,
//             orderStatus: { $in: ['Shipped', 'Delivered'] }
//         }).populate('user products.productId');

//         const workbook = new ExcelJS.Workbook();
//         const worksheet = workbook.addWorksheet('Sales Report');

//         worksheet.columns = [
//             { header: 'Order ID', key: 'orderId', width: 30 },
//             { header: 'Customer', key: 'customerName', width: 30 },
//             { header: 'Product', key: 'productDetails', width: 50 },
//             { header: 'Quantity', key: 'totalQuantity', width: 10 },
//             { header: 'Status', key: 'orderStatus', width: 15 }
//         ];

//         orders.forEach(order => {
//             const productDetails = order.products
//                 .map(product => `${product.productId.productname} (Qty: ${product.productquantity})`)
//                 .join('\n');
            
//             worksheet.addRow({
//                 orderId: order.orderId,
//                 customerName: order.user.name,  // Assuming the populated user field gives you the customer name
//                 productDetails: productDetails,
//                 totalQuantity: order.totalQuantity,
//                 orderStatus: order.orderStatus
//             });
//         });

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
//         res.status(500).send('Error generating Excel file');
//     }
// };


// export const downloadSalesExcel = async (req, res) => {
//     try {
//         const orders = await Order.find({ orderStatus: { $in: ['Shipped', 'Delivered'] } });

//         const workbook = new ExcelJS.Workbook();
//         const worksheet = workbook.addWorksheet('Sales Report');

//         worksheet.columns = [
//             { header: 'Order ID', key: 'orderId', width: 30 },
//             { header: 'Customer', key: 'customerName', width: 30 },
//             { header: 'Products', key: 'products', width: 50 }, // Adjusted header for products
//             { header: 'Total Quantity', key: 'totalQuantity', width: 10 },
//             { header: 'Status', key: 'orderStatus', width: 15 }
//         ];

//         for (const order of orders) {
//             const customer = await User.findById(order.customerId); // Fetch customer details
//             const customerName = customer ? customer.name : 'Unknown';

//             // Create a string for product names and their quantities
//             const productDetails = order.products.map(product => `${product.productname} (Qty: ${product.productquantity})`).join('\n');

//             // Add the row with customer name and product details
//             worksheet.addRow({
//                 orderId: order.orderId,
//                 customerName: customerName,
//                 products: productDetails,
//                 totalQuantity: order.totalQuantity,
//                 orderStatus: order.orderStatus
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
//         res.status(500).send('Error generating Excel file');
//     }
// };


export const downloadSalesExcel = async (req, res) => {
    try {
        // Get the filter from the query parameters
        const filter = req.query.filter || 'all'; // Default to 'all' if no filter is provided
        
        // Use the getDateRange function to get the date range based on the filter
        const dateRange = getDateRange(filter);

        // Fetch orders based on filter and date range
        const orders = await Order.find({
            orderStatus: { $in: ['Shipped', 'Delivered'] },
            ...dateRange // Include date range in the query
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        worksheet.columns = [
            { header: 'Order ID', key: 'orderId', width: 30 },
            { header: 'Customer', key: 'customerName', width: 30 },
            { header: 'Products', key: 'products', width: 50 }, // Adjusted header for products
            { header: 'Total Quantity', key: 'totalQuantity', width: 10 },
            { header: 'Status', key: 'orderStatus', width: 15 }
        ];

        for (const order of orders) {
            const customer = await User.findById(order.customerId); // Fetch customer details
            const customerName = customer ? customer.name : 'Unknown';

            // Create a string for product names and their quantities
            const productDetails = order.products.map(product => `${product.productname} (Qty: ${product.productquantity})`).join('\n');

            // Add the row with customer name and product details
            worksheet.addRow({
                orderId: order.orderId,
                customerName: customerName,
                products: productDetails,
                totalQuantity: order.totalQuantity,
                orderStatus: order.orderStatus
            });
        }

        worksheet.getColumn('products').alignment = { wrapText: true };
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=sales_report.xlsx'
        );

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.log(`Error generating Excel file: ${error}`);
        res.status(500).send('Error generating Excel file');
    }
};




export const downloadSalesPdf = async (req, res) => {
    try {
        // Get the filter from the request query
        const filter = req.query.filter || 'all'; // Default to 'all' if no filter is provided

        // Use the getDateRange function to get the date range based on the filter
        const dateRange = getDateRange(filter);

        // Fetch orders with the specified status and date range
        const orders = await Order.find({
            orderStatus: { $in: ['Shipped', 'Delivered'] },
            ...dateRange // Apply the date range filter
        });

        const doc = new PDFDocument();
        res.setHeader('Content-Disposition', 'attachment; filename=sales_report.pdf');
        res.setHeader('Content-Type', 'application/pdf');

        // Prepare the table structure
        const table = {
            headers: ['Order ID', 'Customer', 'Products', 'Total Quantity', 'Status'],
            rows: []
        };

        // Loop through each order to fetch customer name and product details
        for (const order of orders) {
            const customer = await User.findById(order.customerId); // Fetch customer details
            const customerName = customer ? customer.name : 'Unknown';

            // Create a string for product names and their quantities
            const productDetails = order.products.map(product => `${product.productname} (Qty: ${product.productquantity})`).join('\n ');

            // Push the row into the table data
            table.rows.push([
                order.orderId,
                customerName,
                productDetails,
                order.totalQuantity,
                order.orderStatus
            ]);
        }

        // Generate the PDF table
        // You might need a utility function to create a table in PDFKit, as it's not built-in
        doc.table(table, { width: 500 });

        // Pipe the document to the response
        doc.pipe(res);
        doc.end();
    } catch (error) {
        console.log(`Error generating PDF: ${error}`);
        res.status(500).send('Error generating PDF');
    }
};

// export const downloadSalesPdf = async (req, res) => {
//     try {
//         const orders = await Order.find({ orderStatus: { $in: ['Shipped', 'Delivered'] } });
//         const doc = new PDFDocument();
//         res.setHeader('Content-Disposition', 'attachment; filename=sales_report.pdf');
//         res.setHeader('Content-Type', 'application/pdf');

//         // Prepare the table structure
//         const table = {
//             headers: ['Order ID', 'Customer', 'Products', 'Total Quantity', 'Status'],
//             rows: []
//         };

//         // Loop through each order to fetch customer name and product details
//         for (const order of orders) {
//             const customer = await User.findById(order.customerId); // Fetch customer details
//             const customerName = customer ? customer.name : 'Unknown';

//             // Create a string for product names and their quantities
//             const productDetails = order.products.map(product => `${product.productname} (Qty: ${product.productquantity})`).join('\n ');

//             // Push the row into the table data
//             table.rows.push([
//                 order.orderId,
//                 customerName,
//                 productDetails,
//                 order.totalQuantity,
//                 order.orderStatus
//             ]);
//         }

//         // Generate the PDF table
//         doc.table(table, { width: 500 });

//         // Pipe the document to the response
//         doc.pipe(res);
//         doc.end();
//     } catch (error) {
//         console.log(`Error generating PDF: ${error}`);
//         res.status(500).send('Error generating PDF');
//     }
// };

