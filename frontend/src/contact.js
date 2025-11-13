import {
  frontendSendSMS,
  frontendListAllContactSMS,
  frontendMakeCall,
} from "./phone.js";

const token = localStorage.getItem("token");
if (token) {
  const contactFormDiv = document.getElementById("contact-form-div");
  contactFormDiv.innerHTML = `
  <form action="post" id="create-contact-form">
    <h3>Create Contact:</h3>
    <label for="create-contact-name">Contact Name</label>
    <input type="text" name="create-contact-name" id="create-contact-name">
    <label for="create-contact-number">Contact Number</label>
    <input type="text" name="create-contact-number" id="create-contact-number">
    <input type="submit" value="Save Contact">
  </form>
  `;
  const createContactForm = document.getElementById("create-contact-form");
  createContactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const createContactName = document.getElementById(
      "create-contact-name"
    ).value;
    const createContactNumber = document.getElementById(
      "create-contact-number"
    ).value;
    const createResponse = await fetch(
      "http://localhost:3000/contacts/create",
      {
        method: "post",
        headers: {
          Authorization: token,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: createContactName,
          number: createContactNumber,
        }),
      }
    );
    if (createResponse.status === 201) {
      alert("Contact created!");
      location.reload();
    } else if (createResponse.status === 500) {
      alert("Something's wrong, try again!");
    }
  });

  const contactsDiv = document.getElementById("contacts-div");
  const res = await fetch("http://localhost:3000/contacts", {
    method: "get",
    headers: {
      Authorization: token,
    },
  });
  if (res.status === 200) {
    const contacts = await res.json();
    if (contacts) {
      contactsDiv.innerHTML += contacts
        .map(
          (contact) =>
            `
          <div class="contact-card">
            <p class="contact-card-name">
              Name: <input type="text" id="contact-edit-name-input-${contact._id}" value="${contact.name}">
            </p>
            <p class="contact-card-number">
              Number: <input type="text" id="contact-edit-number-input-${contact._id}" value="${contact.number}">
            </p>
            <p class="contact-sms-message">
              Message: <textarea id="contact-sms-message-input-${contact._id}"></textarea>
            </p>
            <button class="contact-edit-button" data-contact-id="${contact._id}">Edit</button>
            <button class="contact-delete-button" data-contact-id=${contact._id}>Delete</button>
            <button class="contact-sms-button" data-contact-id=${contact._id}>Send SMS</button>
            <button class="contact-call-button" data-contact-id=${contact._id}>Call</button>
            <div id="contact-sms-list-div-${contact._id}"></div>
          </div>
        `
        )
        .join("");
    }
    const contactEditButtons = document.querySelectorAll(
      ".contact-edit-button"
    );
    contactEditButtons.forEach((button) => {
      button.addEventListener("click", async (event) => {
        event.preventDefault();
        const contactId = button.dataset.contactId;
        const contactEditNameInput = document.getElementById(
          `contact-edit-name-input-${contactId}`
        );
        const contactEditNumberInput = document.getElementById(
          `contact-edit-number-input-${contactId}`
        );
        console.log(`http://localhost:3000/contacts/edit/${contactId}`);
        const res = await fetch(
          `http://localhost:3000/contacts/edit/${contactId}`,
          {
            method: "put",
            headers: {
              Authorization: token,
              "content-type": "application/json",
            },
            body: JSON.stringify({
              name: contactEditNameInput.value,
              number: contactEditNumberInput.value,
            }),
          }
        );
        if (res.status === 201) {
          alert("Contact edited!");
          location.reload();
        } else {
          alert(res.text());
          location.reload();
        }
      });
    });
    const contactDeleteButtons = document.querySelectorAll(
      ".contact-delete-button"
    );
    contactDeleteButtons.forEach((button) => {
      button.addEventListener("click", async (event) => {
        event.preventDefault();
        const contactId = button.dataset.contactId;
        const res = await fetch(
          `http://localhost:3000/contacts/delete/${contactId}`,
          {
            method: "delete",
            headers: {
              Authorization: token,
              "content-type": "application/json",
            },
          }
        );
        if (res.status === 204) {
          alert("Contact deleted!");
          location.reload();
        } else {
          alert(await res.text());
          location.reload();
        }
      });
    });

    const smsButtons = document.querySelectorAll(".contact-sms-button");
    smsButtons.forEach((button) => {
      button.addEventListener("click", async (event) => {
        event.preventDefault();
        const smsMessage = document.getElementById(
          `contact-sms-message-input-${button.dataset.contactId}`
        ).value;
        await frontendSendSMS(token, button.dataset.contactId, smsMessage);
      });
    });

    const callButtons = document.querySelectorAll(".contact-call-button");
    callButtons.forEach((button) => {
      button.addEventListener("click", async (event) => {
        event.preventDefault();
        await frontendMakeCall(token, button.dataset.contactId);
      });
    });

    contacts.forEach((contact) => {
      frontendListAllContactSMS(token, contact._id);
    });
  } else if (res.status === 204) {
    contactsDiv.innerHTML = `
      <p>You have no contacts</p>
    `;
  }
} else {
  const phonePageContent = document.getElementById("phone-page-div");
  phonePageContent.innerHTML = `
    <h1>Login to use the phone book</h1>
  `;
}
