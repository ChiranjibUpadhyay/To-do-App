const express=require('express');
const app=express();
const bodyParser=require('body-parser');
const expressValidator=require('express-validator');
const expressSession=require('express-session');
const mongoose=require('mongoose');
const Schema=mongoose.Schema;

mongoose.connect('mongodb://localhost:27017/todo',{useNewUrlParser: true});
mongoose.connection.on('open',function(eff){
  console.log("Connection Successful");
})
mongoose.connection.on('error',function(error){
  console.log("Connection error:",error);
})

app.use(bodyParser.urlencoded({extended:true}));
app.use(expressValidator());
app.use(express.static('public'));
app.use(expressSession({secret:'max',saveUninitialized:false,resave:false}));
app.set('view engine','ejs');

/*var Todolist=[
  "first item",
  "second item"
]*/
//createing a Schema
var todoSchema=new Schema({
  name:String
})
var Todo=mongoose.model('todo',todoSchema);

app.get('/',function(req,res){
  res.render('login',{success:req.session.success,errors:req.session.errors});
  req.session.errors=null;
  req.session.success=null;
});
app.post('/',function(req,res){
  req.check('username','Invalid username').equals('admin');
  req.check('password','Invalid Password').equals('admin');
  var errors=req.validationErrors();
  if(errors){
    req.session.errors=errors;
    req.session.success=false;
  }
  else{
    req.session.success=true;
  }
  res.redirect('/');
});
app.get('/logout',function(req,res){
  req.session.errors=null;
  req.session.success=false;
  res.render('login',{success:req.session.success,errors:req.session.errors});
});
app.get('/insert',function(req,res){
  Todo.find({},function(err,Todolist){
    if(err){
      console.log("Query Error:",err);
    }
    else{
      res.render('insert',{Todolist:Todolist,qs:"",ps:"Add Item"});
    }
  })
});
app.post('/insert',function(req,res){
  if(req.body.item){
    var newItem=new Todo({
      name:req.body.item
    })
    //if(newItem.isNew){
    newItem.save(function(err1,Todo){
      if(err1){
        console.log("Insertion Error:",err1);
      }
      else{
        console.log("Inserted Item:",newItem.name);
      }
    });
  //}
}
  res.redirect('/insert');
})
app.get('/delete/:name',function(req,res){
  Todo.findOneAndDelete({name:req.params.name},function(err2){
    if(err2){
      console.log("Cannot Remove ",req.params.name);
    }
    else{
      console.log("One item Removed:",req.params.name);
    }
    res.redirect('/insert');
  })
});
app.get('/Update/:name',function(req,res){
  Todo.findOneAndDelete({name:req.params.name},function(){});
  Todo.find({},function(err,Todolist){
    if(err){
      console.log("Query Error:",err);
    }
    else{
      res.render('insert',{Todolist:Todolist,qs:req.params.name,ps:"Update"});
    }
  })
})
app.get('/deleteall',function(req,res){
  Todo.deleteMany({},function(err3){
    if(err3){
      console.log("Cannot delete all Todos");
    }
    else{
      console.log("All Todos are deleted");
    }
  })
  res.redirect('/insert');
})
app.listen(3000,function(){
  console.log('Server started...You are listening on port 3000');
})
