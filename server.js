var express=require('express');
var cors=require('cors');
var app=express();
app.use(cors());
app.use(express.static(__dirname+'/public'));
app.get('/',function(req,res){
    res.sendFile('/index.html');
});
app.listen(process.env.PORT || 3000,function(){
    console.log("Server Running");
})