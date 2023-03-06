const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const auth = require("../middleware/auth");

// Create user

router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(200).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

// login

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send();
  }
});

//logout
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

//logout all
router.post("/users/loguotall", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

// Update
router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowed = ["name", "email", "age", "password"];
  const isValidOpartion = updates.every((update) => allowed.includes(update));

  if (!isValidOpartion) {
    return res.status(400).send({ error: "invalid update" });
  }
  try {
    const user = await User.findById(req.user._id);
    updates.forEach((update) => (req.user[update] = req.body[update]));

    await user.save();

    await req.user.updateOne({});
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
});

//delete
router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.deleteOne();
    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});
User.createIndexes();

module.exports = router;
