const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");



const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');
mongoose.connect("mongodb+srv://admin-prachi:Test123@cluster0.nx1sd4c.mongodb.net/todolistDB", { useNewUrlParser: true });


const itemSchema = new mongoose.Schema({
        name : String
      });
const Item = mongoose.model("item", itemSchema);


const listSchema = new mongoose.Schema({
        name : String,
        items: [itemSchema]
      });
const List = mongoose.model("list", listSchema);



const item1= new Item({
        name: "welcome to your to do list"
      });
const item2 = new Item ({
        name: "hit + button to add a new item"
      });

const item3 = new Item ({
        name :"check item to remove item from list"
      });

const defaultItems =[item1, item2, item3];



app.get("/", function(req, res){

      Item.find({}, function(err, foundItems){

          if(foundItems.length ===0){

                Item.insertMany(defaultItems, function(err){

                      if(err){
                        console.log(err);
                      } else {
                        console.log("sucess1");
                        res.render("/");
                      }

                });
          } else {
                res.render("list", {kindOfDay:"Today", OfItem:foundItems})
                  }
    });
});

app.post("/", function(req,res){

      const itemName = req.body.listOfItem;
      const listName = req.body.list;
      const item = new Item({
            name: itemName
          });

      if(listName === "Today"){
        item.save();
        res.redirect("/")

      } else{
        List.findOne({ name: listName }).exec(function(err,foundlist){
          foundlist.items.push(item);
          foundlist.save();
          res.redirect("/"+ listName );
        });
      }


});


app.post("/delete", function(req, res){

      const checkedItemId = _.capitalize(req.body.checkbox);
      const listName = req.body.listName;



      if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId).exec(function(err){

            if(!err){
              console.log("sucessfully deleted the checked item");

                    }
        });

        res.redirect("/");
      } else{
        List.findOneAndUpdate({name: listName}, {$pull: {items:{_id:checkedItemId}}}, function(err, results){
          if(!err){
            res.redirect("/"+ listName);
          }
        });


      }


});


app.get("/:customListName", function(req,res){
      const customListName = req.params.customListName;
      const customListItem = req.params.customListItem;

      List.findOne({ name: customListName }).exec(function(err,foundlist){
        if(!err){



          if(!foundlist){
            const list = new List({
              name: customListName,
              items: defaultItems
            });
            list.save();
            res.redirect("/"+ customListName);


          }else{
            console.log(customListName);
            res.render("list", {kindOfDay:customListName, OfItem: foundlist.items});
          }
        }




});
  });


app.get("/work", function(req, res){
      res.render("list", {kindOfDay:"work", OfItem: workItems});
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, function(req, res){
      console.log("server is running on port 3000");
});
