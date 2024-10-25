


const errorHandler = (err, req, res, next) => {
    const statusCode = err.status || 500;  
    const message = err.message || 'Something went wrong!';
    const referrer = req.headers.referer || '/'; 
  
    
    res.status(statusCode).render('error', {
      title: 'Error',
      statusCode,  
      message,     
      referrer,    
    });
  };
  
  export default errorHandler;
  