const express=require("express");
const https=require("https");
const bodyParser= require("body-parser");
const mongoose= require("mongoose");

const app=express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://127.0.0.1:27017/weatherDB",{useNewUrlParser:true});

const itemsSchema = new mongoose.Schema({
    name: String,
    temp: String,
    dateAndTime: String
});

const Item = mongoose.model("Item",itemsSchema);


app.get("/",function(req,res){
   res.sendFile(__dirname+"/index.html");

});


app.post("/",function(req,res){

    const query=req.body.cityName;
    const unit="metric";
    const secret=""; //api-key
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

                let current = new Date();
                let cDate =  current.getDate()+'-' + (current.getMonth() + 1) + '-' +current.getFullYear();
                let cTime = current.getHours() + ":" + current.getMinutes() + ":" + current.getSeconds();
                let dateTime = cDate + ' ' + cTime;
                dateTime+=' IST';
                

                const item=new Item({
                    name: nameofthecity,
                    temp: temperature,
                    dateAndTime:dateTime
                });

                item.save();
                
                Item.find().then((data) => {
                    // console.log(data);
                    res.render("answer",{
                        citytemp: temperature,
                        nameOfCity: nameofthecity,
                        weather: weatherDescription,
                        posts:data
                    });
                })

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
