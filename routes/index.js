const isLoggedIn = require("../middleware/isLoggedIn");
const isLoggedOut = require("../middleware/isLoggedOut");

const router = require("express").Router();

/* GET home page */
router.get("/", (req, res, next) => {
  if(isLoggedOut){
    res.render("index")
  }
  else{
  res.render("index", { username: req.session.currentUser.username });
}
});





//👁️❗❗❗ EXPORTO EL ENRUTADOR DEFINIDO
module.exports = router;
