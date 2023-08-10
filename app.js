const express = require('express');
var logger = require('morgan');
const app = express();
var Routes = require('./routes/index-route');
<<<<<<< HEAD
const swaggerAutogen = require('swagger-autogen')();

=======
const swaggerFile = require('./swagger_output.json')
const swaggerUi = require('swagger-ui-express');
>>>>>>> 78b00fb15a565dce2924070d225924cc94edc63c

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api', Routes);
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))

app.on('listening',function(){
    console.log('ok, server is running');
});

app.listen(3000)
