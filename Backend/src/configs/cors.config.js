const corsOptions = {
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, 
    allowedHeaders: ['Content-Type', 'Authorization']
};



module.exports = corsOptions;
