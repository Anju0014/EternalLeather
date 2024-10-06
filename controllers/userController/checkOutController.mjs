import razorpayInstance from'../../config/razorpayConfig.mjs'
import crypto from 'crypto';

// export const paymentRender = async (req, res) => {
//     try {
//         const totalAmount = req.body.amount;
//         console.log(req.body)
//         console.log("....." + totalAmount)
//         if (!totalAmount) {
//             return res.status(404).json({ error: "Amount parameter is missing" });
//         }

//         // const instance = new Razorpay({
//         //     key_id: "rzp_test_jyh8u3FB51sm3I",
//         //     key_secret: "5Cz0sGy9qDgUqCLLieURAfkD"
//         // });

//         const options = {
//             amount: totalAmount * 100,
//             currency: "INR",
//             receipt: "receipt#1"
//         };
//         console.log("....." + totalAmount+"flu")
//         razorpayInstance.orders.create(options, (error, order) => {
//             if (error) {
//                 console.log("....." + totalAmount+"flu444")
//                 console.error(`Failed to create order: ${error}`);
//                 return res.status(500).json({ error: `Failed to create order: ${error.message}` });
//             }
//             console.log("....." + totalAmount+"flu444333")
//             return res.status(200).json({ orderID: order.id });
//         });

//     } catch (err) {
//         console.error(`Error on orders in checkout: ${err}`);
//         return res.status(500).json({ error: 'Internal server error' });
//     }
// };
export const paymentRender = async (req, res) => {
    try {
        const totalAmount = req.body.amount; // The amount received from the client
        console.log("Received Amount: " + totalAmount); // Log the received amount

        if (!totalAmount) {
            return res.status(400).json({ error: "Amount parameter is missing" });
        }

        const options = {
            amount: totalAmount * 100, // Amount in paise
            currency: "INR",
            receipt: "receipt#1"
        };
        console.log("89889")
        razorpayInstance.orders.create(options, (error, order) => {
            console.log("hiiii")
            if (error) {
                console.log("....." + totalAmount+"flu444333")
                console.error("Failed to create order:", error); // Log the full error object
                return res.status(500).json({ error: `Failed to create order: ${JSON.stringify(error)}` }); // Return the error as JSON
            }
            console.log(order.id)
            return res.status(200).json({
                orderID: order.id,
                amount: order.amount, // Send back the amount
                key_id: process.env.RAZORPAY_KEY_ID // Include key_id for frontend use
            });
        });
    } catch (err) {
        console.error(`Error on orders in checkout: ${err}`);
        return res.status(500).json({ error: 'Internal server error' });
    }
};



export const paymentVerify = async (req, res) => {
    console.log(req.body)
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  

    const key_secret = process.env.RAZORPAY_KEY_SECRET; // Key secret from Razorpay

    const generated_signature = crypto
        .createHmac('sha256', key_secret)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest('hex');

    if (generated_signature === razorpay_signature) {
        // Signature is valid, process the payment
        res.status(200).json({ success: true });
    } else {
        // Signature is invalid, reject the payment
        res.status(400).json({ success: false });
    }
};
