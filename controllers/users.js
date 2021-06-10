const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const bcrypt = require('bcrypt');
const morgan = require ('morgan')
const session = require('express-session');

//Route to new
router.get('/new', (req, res) => {
    res.render('users/new.ejs');
})

//Create new user
router.post('/new', async(req, res) => {
    try {
        const hash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
        const newUser = new User({
            username: req.body.username,
            password: hash,
            //password: req.body.password,
            messages: req.body.messages
        });
        newUser.save();
        console.log('new user:' + newUser);
        res.redirect('/users/login')
    } catch {
        res.redirect ('/users/new')
    }
    
})

//route to login
router.get('/login', (req, res) => {
    res.render('users/login.ejs')
})

router.post('/login', (req, res) => {
    
    User.findOne({ "username": req.body.username }, (err, foundUser) => {
        if (foundUser === null) {
            res.alert('no user found')
            res.redirect('/users/new')
        } else {
            console.log(foundUser)
            console.log(req.body)
            const matched = bcrypt.compareSync(req.body.password,foundUser.password)
            if (matched) {
                req.session.userId = foundUser._id;
                res.redirect('/room')
            } else {
                res.redirect('/users/login')
            }

        }
    })
})

//route to logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        delete req.user;
        res.redirect('/')
    })
})

module.exports = router;