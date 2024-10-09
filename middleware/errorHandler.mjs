
// function errorHandler(err, req, res, next) {
//     console.error(err.stack);  
//     const statusCode = err.status || 500;
//     res.status(statusCode).json({
//         status: 'error',
//         message: err.message || 'Something went wrong!',
//     });
// }

// export default errorHandler;

const errorHandler = (err, req, res, next) => {
    const statusCode = err.status || 500;  
    const message = err.message || 'Something went wrong!';
    const referrer = req.headers.referer || '/'; 
  
    
    res.status(statusCode).render('error', {
      title: 'Error',
      statusCode,  // Pass the status code
      message,     // Pass the error message
      referrer,    // Pass the referrer URL
    });
  };
  
  export default errorHandler;
  