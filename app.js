const express=require("express");
const bodyParser=require("body-parser");
const app=express();
const mongoose=require("mongoose");
const _=require("lodash");
mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true});
const itemsSchema={
  name:String
};
const Item=mongoose.model("Item",itemsSchema);
const item1=new Item({
  name:"Welcome to do list"
});
const item2=new Item({
  name:"Hit the + button to add new items"
});
const item3=new Item({
  name:"<--Hit this to delete an item"
});
const defaultItems=[item1,item2,item3];
const listSchema={
  name:String,
  items:[itemsSchema]
}
const List=mongoose.model("List",listSchema);
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.get("/",function(req,res){
  Item.find({},function(err,foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems,function(err){
        if (err){
          console.log(err);
        }else{
          console.log("successfully added to db");
        }
      });
      res.redirect("/");
    }else{  res.render("list",{listTitle:"Today",newListItems:foundItems});}
  });
  // var today=new Date();
  // var options={
  //   weekday:"long",
  //   day:"numeric",
  //   month:"long"
  // };
  // var day=today.toLocaleDateString("en-US",options);
  // res.render("list",{kindOfDay:day,newListItems:items});
});
app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list=new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }else{ res.render("list",{listTitle:foundList.name,newListItems:foundList.items});}
    }
  });
})
app.post("/",function(req,res){
  const itemName=req.body.newItem;
  const listName=req.body.list;
  const item=new Item({
    name:itemName
  });
  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }
});
app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("successfully deleted checked item");
        res.redirect("/");
      }
    });
  }else{
      List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
// first one is the codition and second one is whaat should be updated ie pull removes element with the id from exsiting array called items
        if(!err){
          res.redirect("/"+listName);
        }
      });
    }
});
app.listen(process.env.PORT || 3000,function(){
  console.log("Server");
});
