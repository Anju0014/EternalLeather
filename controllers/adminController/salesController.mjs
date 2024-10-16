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

export const adminSales = async (req, res) => {
    try {
        const orderCount = await Order.countDocuments();
        const productCollection = await Category.find({ isActive: true });
        
       
        const filter = req.query.filter || 'all'; 
        const dateRange = getDateRange(filter);
        
     
        const revenueResult = await Order.aggregate([
            { $match: { orderStatus: { $in: ['Shipped', 'Delivered'] }, ...dateRange } }, // Apply the date range
            { $group: { _id: null, total: { $sum: "$totalPayablePrice" } } }
        ]);
        
        const Revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
        
       
        const productCount = await Order.aggregate([
            { $match: dateRange }, 
            { $group: { _id: null, total: { $sum: "$totalQuantity" } } }
        ]);
        
        const shippedDeliveredOrders = await Order.find({
            orderStatus: { $in: ['Shipped', 'Delivered'] },
            ...dateRange 
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
        next(error)
        // res.status(500).send('Error rendering sales report');
    }
};





export const downloadSalesExcel = async (req, res) => {
    try {
       
        const filter = req.query.filter || 'all'; 
        

        const dateRange = getDateRange(filter);

      
        const orders = await Order.find({
            orderStatus: { $in: ['Shipped', 'Delivered'] },
            ...dateRange 
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        worksheet.columns = [
            { header: 'Order ID', key: 'orderId', width: 30 },
            { header: 'Customer', key: 'customerName', width: 30 },
            { header: 'Products', key: 'products', width: 30 }, 
            { header: 'Total Quantity', key: 'totalQuantity', width: 20 },
            {header:'Discount',key:'discountApplied',width:10},
            { header: 'Status', key: 'orderStatus', width: 15 },
           
        ];

        for (const order of orders) {
            const customer = await User.findById(order.customerId); 
            const customerName = customer ? customer.name : 'Unknown';

         
            const productDetails = order.products.map(product => `${product.productname} (Qty: ${product.productquantity})`).join('\n');

           
            worksheet.addRow({
                orderId: order.orderId,
                customerName: customerName,
                products: productDetails,
                totalQuantity: order.totalQuantity,
                discountApplied:order.discountApplied,
                orderStatus: order.orderStatus,
               
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
        // res.status(500).send('Error generating Excel file');
        next(error)
    }
};




export const downloadSalesPdf = async (req, res) => {
    try {
      
        const filter = req.query.filter || 'all'; 

        const dateRange = getDateRange(filter);

     
        const orders = await Order.find({
            orderStatus: { $in: ['Shipped', 'Delivered'] },
            ...dateRange
        });

        const doc = new PDFDocument();
        res.setHeader('Content-Disposition', 'attachment; filename=sales_report.pdf');
        res.setHeader('Content-Type', 'application/pdf');

      
        const table = {
            headers: ['Order ID', 'Customer', 'Products', 'Total Quantity', 'Discount','Status'],
            rows: []
        };

       
        for (const order of orders) {
            const customer = await User.findById(order.customerId); 
            const customerName = customer ? customer.name : 'Unknown';

           
            const productDetails = order.products.map(product => `${product.productname} (Qty: ${product.productquantity})`).join('\n ');

  
            table.rows.push([
                order.orderId,
                customerName,
                productDetails,
                order.totalQuantity,
                order.discountApplied,
                order.orderStatus
            ]);
        }

        doc.table(table, { width: 500 });

      
        doc.pipe(res);
        doc.end();
    } catch (error) {
        console.log(`Error generating PDF: ${error}`);
        next(error)
        // res.status(500).send('Error generating PDF');
    }
};

