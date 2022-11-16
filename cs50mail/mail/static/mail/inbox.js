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

async function send_email(event) {

    // Modifies the default beheavor so it doesn't reload the page after submitting.
    event.preventDefault();
    
    // define the variables taken from compose form field IDs
    const recipients = document.querySelector("#compose-recipients").value;
    const subject = document.querySelector("#compose-subject").value;
    const body = document.querySelector("#compose-body").value;

    const sending = await fetch('/emails', {
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
    });
    
    const unreading = await fetch("/emails/sent")
        .then((response) => response.json()) // response is the data received from fetch
        .then((emails) => {
            console.log({emails});

            const email_id = Math.max(...emails.map(item => item.id));
            console.log({email_id});
            changeToUnread(email_id);
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
            
            const email_element = document.createElement("div");
            email_element.classList.add("email_element");

            mailbox_processor(item, email_element, mailbox);

            email_element.addEventListener("click", () => read_email(item["id"]));
            
            document.querySelector("#emails-view").appendChild(email_element);


        });
    })
}

// TODO function email_processor -- HTML generator
// takes JSON data from loading of mailbox and converts into an email entry html
// to be shown inside the mailbox
function mailbox_processor(item, email_element, mailbox) {
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
// changes read to false after sending the email.
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
function read_email(email_id) {
    
    // Show email view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#email-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    
    document.querySelector("#email-view").innerHTML = "";

    // Get the email's info and build the section.
    fetch(`/emails/${email_id}`)
    .then(response => response.json())
    .then(email => {
        // Print email
        console.log({email});
        // ... do something else with email ...
        build_email(email);
    })
    .catch(error => console.log(error));

    // Set the email to read.
    fetch(`/emails/${email_id}`, {
      method: "PUT",
      body: JSON.stringify({
        read: true
      })
    });
}


// Build the email view > function open_email
function build_email(data) {
    const from = document.createElement("div");
    const to = document.createElement("div");
    const subject = document.createElement("div");
    const timestamp = document.createElement("div");
    const reply_button = document.createElement("button");
    const archive_button = document.createElement("button");
    const unread_button = document.createElement("button");
    const body = document.createElement("div");

    from.innerHTML = `<strong>From: </strong> ${data["sender"]}`;
    to.innerHTML = `<strong>To: </strong> ${data["recipients"].join(", ")}`;
    subject.innerHTML = `<strong>Subject: </strong> ${data["subject"]}`;
    timestamp.innerHTML = `<strong>Timestamp: </strong> ${data["timestamp"]}`;
    body.innerHTML = data["body"];

    //archive button
    archive_button.innerHTML = '<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-archive-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12.643 15C13.979 15 15 13.845 15 12.5V5H1v7.5C1 13.845 2.021 15 3.357 15h9.286zM5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM.8 1a.8.8 0 0 0-.8.8V3a.8.8 0 0 0 .8.8h14.4A.8.8 0 0 0 16 3V1.8a.8.8 0 0 0-.8-.8H.8z"/></svg>  ';
    if (data["archived"]) {
        archive_button.innerHTML += "Unarchive";
    } else {
        archive_button.innerHTML += "Archive";
    }
    archive_button.classList = "btn btn-outline-primary m-2";
    archive_button.addEventListener("click", () => {
        archive_email(data);
        load_mailbox("inbox");
    });

    // unread_button
    unread_button.innerHTML = '<svg width="1em" height="1em" viewBox="0 0 24 24" class="bi bi-archive-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><g> <path fill="none" d="M0 0h24v24H0z"/><path d="M16.1 3a5.023 5.023 0 0 0 0 2H4.511l7.55 6.662 5.049-4.52c.426.527.958.966 1.563 1.285l-6.601 5.911L4 7.216V19h16V8.9a5.023 5.023 0 0 0 2 0V20a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h13.1zM21 7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/> </g> </svg>  ';
    unread_button.innerHTML += "Mark Unread";
    unread_button.classList = "btn btn-outline-primary m-2"
    unread_button.addEventListener("click", async () => {
        await changeToUnread(data["id"]);

        load_mailbox("inbox");
    })

    
    // reply button
    reply_button.innerHTML = '<svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-reply-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M9.079 11.9l4.568-3.281a.719.719 0 0 0 0-1.238L9.079 4.1A.716.716 0 0 0 8 4.719V6c-1.5 0-6 0-7 8 2.5-4.5 7-4 7-4v1.281c0 .56.606.898 1.079.62z"/></svg>  Reply';
    reply_button.classList = "btn btn-outline-primary m-2";
    reply_button.addEventListener("click", () => compose_reply(data));

    // append all elements to email-view
    document.querySelector("#email-view").appendChild(from);
    document.querySelector("#email-view").appendChild(to);
    document.querySelector("#email-view").appendChild(subject);
    document.querySelector("#email-view").appendChild(timestamp);
    document.querySelector("#email-view").appendChild(archive_button);
    document.querySelector("#email-view").appendChild(reply_button);
    document.querySelector("#email-view").appendChild(unread_button);
    document.querySelector("#email-view").appendChild(document.createElement("hr"));
    document.querySelector("#email-view").appendChild(body);

}

// TODO archive_email
function archive_email(data) {
    fetch(`/emails/${data["id"]}`, {
      method: "PUT",
      body: JSON.stringify({
        archived: !data["archived"]
      })
    });
}

// TODO compose_reply
function compose_reply(data) {
    // Show compose view and hide other views
    document.querySelector("#emails-view").style.display = "none";
    document.querySelector("#email-view").style.display = "none";
    document.querySelector("#compose-view").style.display = "block";
  
    // Clear out composition fields
    document.querySelector("#compose-recipients").value = data["sender"];
    document.querySelector("#compose-subject").value = ((data["subject"].match(/^(Re:)\s/)) ? data["subject"] : "Re: " + data["subject"]);
    document.querySelector("#compose-body").value = `On ${data["timestamp"]} ${data["sender"]} wrote:\n${data["body"]}\n-------------------------------------\n`;
}