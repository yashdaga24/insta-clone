const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/keys');
const requireLogin = require('../middleware/requireLogin');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { SENDGRID_API, EMAIL } = require('../config/keys');

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: SENDGRID_API,
    },
  })
);

// @route POST /auth/signup
// @desc Register new User
// @access Public
router.post('/signup', (req, res) => {
  const { name, email, password, pic } = req.body;
  if (!email || !password || !name) {
    return res.status(422).json({ error: 'please add all the fields' });
  }
  User.findOne({ email: email })
    .then((savedUser) => {
      if (savedUser) {
        return res
          .status(422)
          .json({ error: 'User already exists with that email' });
      }
      // This 12 is not needed later while checking as the hash stores this salt
      bcrypt.hash(password, 12).then((hashedpassword) => {
        const user = new User({
          email,
          password: hashedpassword,
          name,
          pic,
        });

        user
          .save()
          .then((user) => {
            transporter.sendMail({
              to: user.email,
              from: 'yashdaga26@gmail.com',
              subject: 'signup success',
              html: '<h1>Welcome to Slate</h1>',
            });
            res.json({ message: 'saved successfully' });
          })
          .catch((err) => {
            console.log(err);
          });
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

// @route POST /auth/signin
// @desc Login Registered User
// @access Public
router.post('/signin', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).json({ error: 'please add email or password' });
  }
  User.findOne({ email: email }).then((savedUser) => {
    if (!savedUser) {
      return res.status(422).json({ error: 'Invalid Email or password' });
    }
    bcrypt
      .compare(password, savedUser.password)
      .then((doMatch) => {
        if (doMatch) {
          // res.json({message:"successfully signed in"})
          const token = jwt.sign({ _id: savedUser._id }, JWT_SECRET);
          const {
            _id,
            name,
            email,
            followers,
            following,
            pic,
            private,
            pendingrequests,
          } = savedUser;
          res.json({
            token,
            user: {
              _id,
              name,
              email,
              followers,
              following,
              pic,
              private,
              pendingrequests,
            },
            // If we send directly password will also be sent
          });
        } else {
          return res.status(422).json({ error: 'Invalid Email or password' });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
});

router.post('/reset-password', (req, res) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
    }
    const token = buffer.toString('hex');
    User.findOne({ email: req.body.email }).then((user) => {
      if (!user) {
        return res
          .status(422)
          .json({ error: 'No user exists with that email' });
      }
      user.resetToken = token;
      user.expireToken = Date.now() + 3600000;
      user.save().then((result) => {
        transporter.sendMail({
          to: user.email,
          from: 'yashdaga26@gmail.com',
          subject: 'password reset',
          // <h5>click in this <a href="${EMAIL}/reset/${token}">link</a> to reset password</h5>
          html: `
                     <p>You requested for password reset</p>
                     <h5>click in this <a href="http://localhost:3000/reset/${token}">link</a> to reset password</h5>
                     `,
        });
        res.json({ message: 'check your email' });
      });
    });
  });
});

router.post('/new-password', (req, res) => {
  const newPassword = req.body.password;
  const sentToken = req.body.token;
  User.findOne({ resetToken: sentToken, expireToken: { $gt: Date.now() } })
    .then((user) => {
      if (!user) {
        return res.status(422).json({ error: 'Try again session expired' });
      }
      bcrypt.hash(newPassword, 12).then((hashedpassword) => {
        user.password = hashedpassword;
        user.resetToken = undefined;
        user.expireToken = undefined;
        user.save().then((saveduser) => {
          res.json({ message: 'password updated success' });
        });
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
