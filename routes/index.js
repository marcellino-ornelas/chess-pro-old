/*
 * node_modules
*/
const http = require('http');
const path = require('path');
const importer = require('../lib/importer')(__dirname);

const express = require('express');
const router = express.Router();

const views = importer('./views');
/*
 * Routes
*/
router.get('/',views.index);

/*
 * examples
*/

// router.get(/* your route goes here*/, function(req,res){
// 	/* your code goes here*/
// })
// router.post(/* your route goes here*/, function(req,res){
// 	/* your code goes here*/
// })

module.exports = router