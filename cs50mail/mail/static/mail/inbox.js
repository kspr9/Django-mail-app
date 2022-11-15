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
    .then(result => {
        console.log({result});
    })
    .then(fetch("/emails/sent")
        .then((response) => response.json()) // response is the data received from fetch
        .then((emails) => {
            console.log({emails});

            const email_id = Math.max(...emails.map(item => item.id));
            console.log({email_id});
            changeToUnread(email_id);
            
    }))
    .then(load_mailbox("sent"));

    

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
            
            const email_element = document.createElement("div");
            email_element.classList.add("email_element");

            email_processor(item, email_element, mailbox);

            email_element.addEventListener("click", () => read_email(item["id"]));
            
            document.querySelector("#emails-view").appendChild(email_element);


        });
    })
}

// TODO function email_processor
// takes JSON data from loading of mailbox and converts into an email entry 
// to be shown inside the mailbox
function email_processor(item, email_element, mailbox) {
    if (mailbox === "inbox" && item["archived"]) {
        return;
    }
    else if (mailbox === "archive" && !item["archived"]) {
        return;
    }
    
    // parsing data from json for the email view at mailbox
    const content = document.createElement("div");
    const recipients = document.createElement("em");
    const pre_description = document.createElement("strong");
    const subject = document.createElement("strong")

    subject.innerHTML = "Subject: ";

    // when mailbox owner looks into sent then recipient should we visible
    if (mailbox === "sent") {
        pre_description.innerHTML = "Sent to: ";
        recipients.innerHTML = item["recipients"].join(", ") + "    ";
      } // in inbox, the sender should be shown
      else {
        pre_description.innerHTML = "Received from: ";
        recipients.innerHTML = item["sender"] + "    ";
      }
    content.append(pre_description, recipients, subject, item["subject"]);  
    

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

// TODO changeToUnread(email_id)

function changeToUnread(email_id) {
    // Set the email to unread.
    fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: false
        })
    });
}

// TODO: function read_email



// Build the email view > function open_email
function open_email(email_data) {

}