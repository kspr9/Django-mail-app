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
        console.log({result});
        // load the sent mailbox
    });

    load_mailbox("sent");

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

function load_mailbox(mailbox) {
  

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

            email_processor(item, email_element, mailbox);

            email_element.addEventListener("click", () => read_email(item["id"]));
            
            document.querySelector("#emails-view").appendChild(email_element);

            
        });
    })
}

// TODO: function read_email

// TODO function email_processor
function email_processor(item, email_element, mailbox) {
    if (mailbox === "inbox" && item["archived"]) {
        return;
    }
    else if (mailbox === "archive" && !item["archived"]) {
        return;
    }
    
    // parsing data from json for the email view at mailbox
    const recipients = document.createElement("strong")
    recipients.innerHTML = item["recipients"].join(", ") + " ";

    const content = document.createElement("div");

    // when mailbox owner looks into sent then recipient should we visible
    if (mailbox === "sent") {
        recipients.innerHTML = item["recipients"].join(", ") + " ";
      } // in inbox, the sender should be shown
      else {
        recipients.innerHTML = item["sender"] + " ";
      }
    content.appendChild(recipients);
    content.innerHTML += item["subject"]

    // styling

    // Set and style the date.
    const date = document.createElement("div");
    date.innerHTML = item["timestamp"];
    date.style.display = "inline-block";
    date.style.float = "right";

    if (item["read"]) {
        email_element.style.backgroundColor = "grey";
        date.style.color = "black";
    } else {
        date.className = "text-muted";
    }
    content.appendChild(date);

    content.style.padding = "10px";
    email_element.appendChild(content);


    // Style the parent element.
    email_element.style.borderStyle = "solid";
    email_element.style.borderWidth = "3px";
    email_element.style.margin = "10px";

}

// Build the email view > function open_email
function open_email(email_data) {

}