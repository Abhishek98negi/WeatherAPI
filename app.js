require('dotenv').config();
const express=require("express");
const https=require("https");
const bodyParser= require("body-parser");
const mongoose= require("mongoose");

const app=express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/weatherDB");

var itemsSchema ={
    name: String,
    temp: String,
    dateAndTime: String
};

const Item =mongoose.model("Item",itemsSchema);


app.get("/",function(req,res){
   res.sendFile(__dirname+"/index.html");

});


app.post("/",function(req,res){

    const query=req.body.cityName;
    const unit="metric";
    const secret=process.env.SECRET;
    const url="https://api.openweathermap.org/data/2.5/weather?q="+query+"&appid="+secret+"&units="+unit;

    https.get(url,function(response){

        if(response.statusCode===404){
            res.sendFile(__dirname+"/failure.html");
        }
        else{
            response.on("data",function(data){
                var hex = data.toString();
                var weatherData=JSON.parse(hex);
                // console.log(weatherData);
                const temperature=weatherData.main.temp;

                const weatherDescription=weatherData.weather[0].description;
                const nameofthecity=weatherData.name;

                var d = new Date();
                var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
                var nd = new Date(utc + (3600000*5.5));
                var time=nd.toLocaleString();
                const timeNeedToChange = new Date(time);
                var timeInString= timeNeedToChange.toString();
                // console.log(timeInString);

                var timestamp="";

                for(let i=0; i<timeInString.length; i++){
                    if(timeInString[i+1]==='G' && timeInString[i+2]==='M')break;
                    else timestamp+=timeInString[i];
                }

                timestamp+=" IST";
                console.log(timestamp);

                var item=new Item({
                    name: nameofthecity,
                    temp: temperature,
                    dateAndTime:timestamp
                });

                item.save();

                Item.find({}, function(err,foundItems){

                    res.render("answer",{
                        citytemp: temperature,
                        nameOfCity: nameofthecity,
                        weather: weatherDescription,
                        posts:foundItems
                    });
                });
            });

        }

    });
});

app.get("/index",function(req,res){
   res.sendFile(__dirname+"/index.html");

});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port,function(){
    console.log("Server is running successfully.");
})
