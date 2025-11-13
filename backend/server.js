import express from "express";
import cors from "cors";
import "dotenv/config";
import { ObjectId } from "mongodb";
import { signup, login } from "./controllers/userController.js";
import {
  contacts,
  createContact,
  deleteContact,
  getContact,
  editContact,
} from "./controllers/contactController.js";
import {
  sendSMS,
  getSMSForContact,
  makePrankCall,
} from "./controllers/phoneController.js";
import { userCollection } from "./services/db.js";
import { validateToken } from "./services/jwt.js";

const port = 3000;
const app = express();

app.use(cors());
app.use(express.json());

async function auth(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(400).send("Missing Authentication Header!");
  }
  let user;
  try {
    user = await validateToken(req.headers.authorization);
  } catch (e) {
    return res.status(400).send("Invalid Authorization Token!");
  }
  try {
    user = await userCollection.findOne({
      _id: new ObjectId(user._id),
      email: user.email,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).send("Internal Server Error!");
  }
  req.user = user;
  next();
}

app.post("/signup", signup);
app.post("/login", login);
app.get("/contacts", auth, contacts);
app.get("/contacts/:id", auth, getContact);
app.post("/contacts/create", auth, createContact);
app.put("/contacts/edit/:id", auth, editContact);
app.delete("/contacts/delete/:id", auth, deleteContact);
app.post("/sms/send", auth, sendSMS);
app.get("/sms/:contactId", auth, getSMSForContact);
app.post("/call/prank-call", auth, makePrankCall);

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
