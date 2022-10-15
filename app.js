require("dotenv").config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const _ = require('lodash');

var app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}))

mongoose.connect(process.env.mongoUrl);

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = new mongoose.model("Item", itemsSchema);

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
})

const List = new mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems) {
    if (err) {
      console.log(err);
    } else {
      res.render("list", {
        list: "Home",
        eItems: foundItems
      });
    }
  });
})

app.post("/", function(req, res) {
  const newItem = new Item({
    name: req.body.newItem
  });
  if (req.body.list === 'Home') {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: req.body.list
    }, function(err, foundList) {
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + req.body.list);
    });
  }
})

app.post("/delete", function(req, res) {
  if (req.body.listName === 'Home') {
    Item.findByIdAndRemove(req.body.checkbox, function(err) {
      if (err) {
        console.log(err);
      }
    });
    res.redirect('/');
  } else {
    List.findOneAndUpdate({
      name: req.body.listName
    }, {
      $pull: {
        items: {
          _id: req.body.checkbox
        }
      }
    }, function(err, foundList) {
      if (err) {
        console.log(err);
      }
      res.redirect("/" + req.body.listName);
    })
  }
});

app.get("/:listName", function(req, res) {
  List.findOne({
    name: _.capitalize(req.params.listName)
  }, function(err, foundList) {
    if (err) {
      console.log(err);
    } else if (foundList) {
      res.render("list", {
        list: _.capitalize(req.params.listName),
        eItems: foundList.items
      });
    } else {
      const newList = new List({
        name: _.capitalize(req.params.listName),
        items: []
      });
      newList.save();
      res.render("list", {
        list: _.capitalize(req.params.listName),
        eItems: newList.items
      });
    }
  })
});

app.listen(process.env.PORT, function() {
  console.log("Successfully running");
})
