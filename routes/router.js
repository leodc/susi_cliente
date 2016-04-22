var express = require('express');
var router = express.Router();


router.get('/', function(req, res) {
  res.render("index");
});

router.get('/:id_landsat', function(req, res) {
  res.render("landsat");
});


module.exports = router;
