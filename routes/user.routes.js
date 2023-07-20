//👁️❗❗❗HAGO ESTE CODIGO COMENTADO, ASÍ APRENDO
// Y COMPRENDO MEJOR LAS RUTAS ❗❗❗👁️:

//👁️❗❗❗IMPORTO EL MODULO DE EXPRESS
const express = require("express");

//👁️❗❗❗CREO EL ENRUTADOR CON EL METODO DE EXPRESS ROUTER() PARA PODER DEFINIR MIS RUTAS
const router = express.Router();

//------------------------------------------------------------------
                //👁️❗❗❗IMPORTANTE ❗❗❗👁️
//REQUERIMOS BCRYPT T CREAMOS VARIABLE saltRound CON SU VALOR
//ESTO LO HACEMOS DESPUES DE CREAR LA RUTA CREATE PARA SIGNUP*
const bcrypt = require("bcryptjs");
const saltRounds = 10;      
//------------------------------------------------------------------


//👁️❗❗❗IMPORTO EL MODELO USER
const User = require("../models/User.model");

//👁️❗❗❗IMPORTO LOS MIDDLEWARES
const isLoggedIn = require("../middleware/isLoggedIn");
const isLoggedOut = require("../middleware/isLoggedOut");
const isAdmin = require("../middleware/isAdmin");


//RUTA 1
//👁️❗❗❗DEFINIMOS UNA RUTA GET QUE RENDERIZA LA `PLANTILLA EN USER/SIGNUP CUANDO ACCEDAMOS A LA RUTA /SIGNUP
router.get("/signup", isLoggedOut, (req, res, next) => {
    res.render("user/signup");
  });

//RUTA 2
//👁️❗❗❗DEFINIMOS LA RUTA POST PARA MANEJAR EL FORMULARIO DE
//REGISTROS DE USUARIOS "/SIGNUP"
router.post("/signup", isLoggedOut,(req, res, next) => {
    //2.1 Se extraen los valores del req.body
    let { username, password, passwordRepeat } = req.body;

    //2.2 Se verifica que no haya campos vacíos
    if (username == "" || password == "" || passwordRepeat == "") {
      res.render("user/signup", {
        errorMessage: "Debe rellenar todos los campos.",
      });
      return;
    }
  
    //2.2 Se verifica que coincidan los passwords
    if (password != passwordRepeat) {
      res.render("user/signup", {
        errorMessage: "Los Password no coinciden.",
      });
      return;
    }
  
    //2.2 Se verifica que no exista ya el usuario haciendo
    //busqueda en nuestra db mediante el metodo .find()
    User.find({ username })
      .then((result) => {
        if (result.length != 0) {
          res.render("user/signup", {
            errorMessage:
              "Este usuario ya existe",
          });
          return;
        }
//------------------------------------------------------------------
                //👁️❗❗❗IMPORTANTE ❗❗❗👁️
        //DESPUES DE TERMINAR LA RUTA POST Y COMPROBAR QUE SE CREAN
        //DATOS EN MI DB PROCEDO A ENCRIPTAR LA CONTRASEÑA
        //PREVIA INSTALACIÓN DE bcrypt --- npm install bcrypt ---
        //TAMBIÉN REQUERIMOS BCRYPT Y CREAMOS LA VARIABLE saltRound
        //ARRIBA, DEBAJO DEL REQUERIMIENTO DE EXPRESS
        //ESTO LO HACEMOS DESPUES DE CREAR LA RUTA CREATE PARA SIGNUP*

        let salt = bcrypt.genSaltSync(saltRounds);
        let passwordEncriptada = bcrypt.hashSync(password, salt);
//------------------------------------------------------------------


        //2.3 Si no existe el usuario crea uno nuevo con 
        // el metodo .create() dandole los valores username y password
        //introducidos en el formulario de "/signup"
        User.create({ username, 
            password: passwordEncriptada })
          .then(() => {
            res.redirect("/user/login");
          })
          .catch((err) => next(err));
      })
      .catch((err) => next(err));
  });


//RUTA 3
//👁️❗❗❗DEFINIMOS UNA RUTA GET QUE RENDERIZA LA `PLANTILLA EN USER/LOGIN CUANDO ACCEDAMOS A LA RUTA /LOGIN  
router.get("/login", isLoggedOut, (req, res, next) => {
    console.log("req.session: ", req.session);
    res.render("user/login");
  }); 
  

//RUTA 4
//👁️❗❗❗DEFINIMOS LA RUTA POST PARA MANEJAR EL FORMULARIO DE
//LOGIN EN "/LOGIN"
router.post("/login", isLoggedOut,(req, res, next) => {
    //4.1 Se extraen los valores del req.body
     let { username, password } = req.body;

    //4.2 Se verifica que el usuario no deje campos vacíos
    if (username == "" || password == "") {
        res.render("user/login", { errorMessage: "Faltan campos por rellenar." });
      }
  
    //4.3 Se verifica que el usuario exista
    User.find({ username })
    .then((result) => {
      if (result.length == 0) {
        res.render("user/login", isLoggedOut,{
          errorMessage: "El usuario no existe, por favor regístrate.",
        });
      }

        //4.4 Se verifica si la contraseña proporcionada
        //por el usuario coincide con la contraseña almacenada
        //en la base de datos utilizando el método
        //bcrypt.compareSync(). 
        //Si la comparación es exitosa, se crea un objeto de usuario
        //con información adicional para su uso posterior en
        //la aplicación
        if (bcrypt.compareSync(password, result[0].password)) {
            let usuario = {
              username: result[0].username,
              isAdmin: result[0].isAdmin,
            };
  
            req.session.currentUser = usuario;
            console.log("req.session.currentUser: ", req.session.currentUser);
            res.redirect("/user/profile");
            } else {
            res.render("user/login", {
            errorMessage: "Credenciales incorrectas.",
            });
        }
        })
        .catch((err) => next(err));
    });



  router.get("/profile", isLoggedIn,(req, res, next) => {
    console.log("req.session.currentUser: ", req.session.currentUser);
    res.render("user/profile", { username: req.session.currentUser.username });
  });


  router.get("/logout", isLoggedIn, (req, res, next) => {
    req.session.destroy((err) => {
      if (err) {
        next(err);
      } else {
        res.redirect("/user/login");
      }
    });
  });
  
  
  

  router.get("/main", isLoggedIn, (req, res, next) => {
    res.render("user/main", { username: req.session.currentUser.username })
  }); 




//👁️❗❗❗ EXPORTO EL ENRUTADOR DEFINIDO
module.exports = router;
