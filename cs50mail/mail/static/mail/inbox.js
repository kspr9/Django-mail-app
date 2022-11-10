document.addEventListener('DOMContentLoaded', function() {

  

  // Use buttons to toggle between views
  document
    .querySelector('#inbox')
    .addEventListener('click', () => load_mailbox('inbox'));
  document
    .querySelector('#sent')
    .addEventListener('click', () => load_mailbox('sent'));
  document
    .querySelector('#archived')
    .addEventListener('click', () => load_mailbox('archive'));
  document
    .querySelector('#compose')
    .addEventListener('click', compose_email_view);

  // Add event listener to the form
  document
    .querySelector("#compose-form")
    .addEventListener("submit", send_email);

  load_mailbox('inbox');

});

function send_email(event) {

    // Modifies the default beheavor so it doesn't reload the page after submitting.
    event.preventDefault();
    
    // define the variables taken from compose form field IDs
    const recipients = document.querySelector("#compose-recipients").value;
    const subject = document.querySelector("#compose-subject").value;
    const body = document.querySelector("#compose-body").value;

    fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
            recipients: recipients,
            subject: subject,
            body: body
        })
    })
    .then(response => response.json())
    .then((result) => {
        console.log(result);
        // load the sent mailbox
        load_mailbox("sent", message);
    });

}

function compose_email_view() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox, message="") {
  
  // Delete any messages if any
  document.querySelector("#message-div").textContent = "";

  // Print a message if any.
  if (message !== "") {
    make_alert(message);
  }
  


  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // load emails from mailbox 
  fetch(`/emails/${mailbox}`)
    .then((response) => response.json()) // response is the data received from fetch
    .then((emails) => {
        emails.forEach((item) => {
            console.log(item);

            const email_element = document.createElement("div");
            email_element.classList.add("email_element");

            build_emails(item, email_element, mailbox);

            //email_element.addEventListener("click", () => read_email(item["id"]));
            
            document.querySelector(".email_div").innerHTML = `${item}`;
            document.querySelector("#emails-view").appendChild(email_div);

            
        });
    })
}

// TODO: function read_email

// TODO function build_emails
function build_emails(item, email_element, mailbox) {
    if (mailbox === "inbox" && item["archived"]) {
        return;
    }
    else if (mailbox === "archive" && !item["archived"]) {
        return;
    }
    
    const content = document.createElement("div");

    const recipients = document.createElement("strong")

    // decide what goes into recipients element, add HTML
    if (mailbox === "sent") {
        recipients.innerHTML = item["recipients"].join(", ") + " ";
    }
    else {
        recipients.innerHTML = item["sender"] + " ";
    }

    
    content.appendChild(recipients);
    content.innerHTML += item["subject"]

}
