export async function frontendSendSMS(token, contactId, message) {
  const res = await fetch("http://localhost:3000/sms/send", {
    method: "post",
    headers: {
      Authorization: token,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      contactId: contactId,
      message: message,
    }),
  });
  if (res.status === 200) {
    alert(await res.text());
    location.reload();
  } else {
    alert(await res.text());
    location.reload();
  }
}

export async function frontendListAllContactSMS(token, contactId) {
  const smsDiv = document.getElementById(`contact-sms-list-div-${contactId}`);
  const res = await fetch(`http://localhost:3000/sms/${contactId}`, {
    method: "get",
    headers: {
      Authorization: token,
    },
  });
  if (res.status === 200) {
    const contactSMSList = await res.json();
    smsDiv.innerHTML += contactSMSList.map(
      (sms) => `
            <div>
                ${sms.message}
            </div>
        `
    );
  } else {
    smsDiv.innerHTML = "<p>There is no SMS for this contact</p>";
  }
}

export async function frontendMakeCall(token, contactId) {
  const res = await fetch("http://localhost:3000/call/prank-call", {
    method: "post",
    headers: {
      Authorization: token,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      contactId: contactId,
    }),
  });

  if (res.status === 200) {
    alert(await res.text());
  } else {
    alert("Call failed: " + (await res.text()));
  }
}
