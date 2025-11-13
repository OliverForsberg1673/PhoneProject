import { ObjectId } from "mongodb";
import { contactCollection, smsCollection } from "../services/db.js";

const username = process.env.ELKS_USERNAME;
const password = process.env.ELKS_PASSWORD;
const sender = process.env.ELKS_SENDER;
const userPhone = process.env.USER_PHONE;
const auth = Buffer.from(username + ":" + password).toString("base64");

export async function getSMSForContact(req, res) {
  try {
    const contactId = req.params.contactId;
    const contactSMS = await smsCollection
      .find({
        contactId: new ObjectId(contactId),
        userId: new ObjectId(req.user._id),
      })
      .toArray();

    if (contactSMS && contactSMS.length > 0) {
      return res.status(200).send(contactSMS);
    } else {
      return res.status(204).send();
    }
  } catch (e) {
    console.error(e);
    return res.status(500).send("Internal Server Error!");
  }
}

export async function sendSMS(req, res) {
  const formData = req.body;
  const contactId = formData.contactId;
  const message = formData.message;
  const contact = await contactCollection.findOne({
    _id: new ObjectId(contactId),
  });
  let data = {
    from: sender,
    to: contact.number,
    message: `Hello ${contact.name}, Here is your message: ${message}`,
  };
  data = new URLSearchParams(data);
  data = data.toString();
  try {
    const response = await fetch("https://api.46elks.com/a1/sms", {
      method: "post",
      headers: {
        Authorization: "Basic " + auth,
      },
      body: data,
    });
    if (response.status === 200) {
      const responseJSON = await response.json();
      if (
        responseJSON.status === "created" ||
        responseJSON.status === "sent" ||
        responseJSON.status === "delivered"
      ) {
        responseJSON.userId = req.user._id;
        responseJSON.contactId = contact._id;
        await smsCollection.insertOne(responseJSON);
        return res.status(200).send("Message sent and saved to history!");
      } else {
        console.error("46Elks failled to send message: ", responseJSON);
        res
          .status(500)
          .send(
            "Unable to send the text message, try again or contact support!"
          );
      }
    } else {
      console.error("Failed to send message: ", response);
      return res.status(500).send("Failed to send message!");
    }
  } catch (e) {
    console.error(e);
    return res.status(500).send("Internal Server Error!");
  }
}

export async function makePrankCall(req, res) {
  const formData = req.body;

  const contact = await contactCollection.findOne({
    _id: new ObjectId(formData.contactId),
  });

  if (!contact) {
    return res.status(404).send("Contact not found!");
  }

  let data = {
    from: userPhone,
    to: contact.number,
    voice_start: JSON.stringify({
      recordcall: "https://46elks.vercel.app/recordings",
      play: "https://46elks.vercel.app/mp3",
    }),
  };

  data = new URLSearchParams(data);
  data = data.toString();

  try {
    const response = await fetch("https://api.46elks.com/a1/calls", {
      method: "post",
      headers: {
        Authorization: "Basic " + auth,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: data,
    });

    const responseJSON = await response.json();

    if (responseJSON.state === "ongoing") {
      return res
        .status(200)
        .send("You have successfully prank called your contact!");
    } else {
      console.error(responseJSON);
      return res.status(500).send("Prank call unsuccessful, try again!");
    }
  } catch (e) {
    console.error(e);
    return res.status(500).send("Internal Server Error!");
  }
}
