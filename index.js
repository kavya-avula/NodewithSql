const {faker} =require('@faker-js/faker');
const mysql=require('mysql2');
const express=require("express");
const app =express();
const path=require("path");
const methodOverride=require("method-override");
const { v4: uuidv4 } = require("uuid");

app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));
const connection=mysql.createConnection({
        host:'localhost',
        user:'root',
        database:'delta_app',
        password:'Subbareddy.202',
    });

    let getRandomUser=()=>{
        return [
         faker.datatype.uuid(),
         faker.internet.userName(),
         faker.internet.email(), 
         faker.internet.password(),
           
        ];
    };
// let q="insert into user (id,username,email,password) values ?";
app.get("/",(req,res)=>{
    let q=`select count(*) from user`;
    try{
    connection.query(q,(err,result)=>{
        if(err) throw err;
      let count=result[0]["count(*)"];
        res.render("home.ejs",{count});
    });
    }catch(err){
        console.log(err);
        res.send("some error in homepage");
    }
  
});


app.listen("8080",()=> {
    console.log("server is listening to port 8080");
});

//show route 

app.get("/users",(req,res)=> {
    let q=`select * from user`;
    try{
        connection.query(q,(err,users)=>{
            if(err) throw err;
         //console.log(result);
           // res.send(result);
           res.render("showusers.ejs",{users});
        });
        }catch(err){
            console.log(err);
            res.send("some error in homepage");
        }
});

//edit route

app.get("/user/:id/edit",(req,res)=>{
    let{id}=req.params;
    let q=`select * from user where id='${id}'`;
    try{
        connection.query(q,(err,result)=>{
            if(err) throw err;
            let user=result[0];
            console.log(result);
            res.render("edit.ejs",{user});
        });
        }catch(err){
            console.log(err);
            res.send("some error in homepage");
        }
});

//update route

app.patch("/user/:id",(req,res)=>{
    let{id}=req.params;
    let{password:formpwd,username:newUsername}=req.body;

    let q=`select * from user where id='${id}'`;
    try{
        connection.query(q,(err,result)=>{
            if(err) throw err;
            let user=result[0];
            if(formpwd!=user.password){
                res.send("incorrect password");
            }else{
                let q2=`UPDATE user SET username='${newUsername}' WHERE id='${id}'`;
                connection.query(q2,(err,result)=>{
                    if(err) throw err;
                    res.redirect("/users");
                });
            }
       
        });
        }catch(err){
            console.log(err);
            res.send("some error in homepage");
        }

   
});

//add 

app.get("/user/new", (req, res) => {
    res.render("new.ejs");
  });


app.post("/user/new",(req,res)=>{
let {username,email,password}=req.body;
let id=uuidv4();
let q=`INSERT into user (id,username,email,password) values ('${id}','${username}','${email}','${password}')`;
try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      console.log("added new user");
      res.redirect("/users");
    });
  } catch (err) {
    res.send("some error occurred");
  }
});

//delete

app.get("/user/:id/delete", (req, res) => {
    let { id } = req.params;
    let q = `SELECT * FROM user WHERE id='${id}'`;
  
    try {
      connection.query(q, (err, result) => {
        if (err) throw err;
        let user = result[0];
        res.render("delete.ejs", { user });
      });
    } catch (err) {
      res.send("some error with DB");
    }
  });


app.delete("/user/:id",(req,res)=>{
    let{id}=req.params;
    let {password}=req.body;
    let q=`select * from user where id='${id}'`;
    try {
        connection.query(q, (err, result) => {
          if (err) throw err;
          let user = result[0];
    
          if (user.password != password) {
            res.send("WRONG Password entered!");
          } else {
            let q2 = `DELETE FROM user WHERE id='${id}'`; //Query to Delete
            connection.query(q2, (err, result) => {
              if (err) throw err;
              else {
                console.log(result);
                console.log("deleted!");
                res.redirect("/users");
              }
            });
          }
        });
      } catch (err) {
        res.send("some error with DB");
      }
    });