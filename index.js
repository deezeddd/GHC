const app = require('express')();
const bodyparser = require("body-parser");
const moment = require("moment");
const port = 3000;
const cron = require("node-cron");

app.use(bodyparser.json())

// In-memory storage for abandoned checkouts
let abandonedCheckouts = [];

app.get('/', (req, res) => {
  res.send('Assignment GHC!');
});


app.post("/checkout", (req, res) => {
  const checkoutData = req.body;

  // Store the checkout data
  abandonedCheckouts.push({
    customerId: checkoutData?.email, // Assuming customer email is in the body
    cartItems: checkoutData?.line_items, // Assuming line items are in the body
    createdAt: new Date(checkoutData?.created_at),
    status: "pending", // Status to track if the reminder has been sent
    messagesSent: [], // Store timestamps of sent messages
  });

  console.log(`Checkout created for ${checkoutData?.email?? `guest` }`);
  res.status(200).send("Checkout received");
});



// Function to check for abandoned checkouts and send reminders
async function checkAbandonedCheckouts() {
  const now = new Date();

  const reminders = [
    { delay: 30 * 60 * 1000, message: "First reminder after 30 minutes" }, // 30 minutes
    { delay: 24 * 60 * 60 * 1000, message: "Second reminder after 1 day" }, // 1 day
    { delay: 3 * 24 * 60 * 60 * 1000, message: "Third reminder after 3 days" }, // 3 days
  ];

  /* NOTE: 
    abandonedCheckouts is an array, which stores all the abandoned checkout details, if the status of checkout is pending
    then the messages will be sent to the email at T+X time. I've simulated the message sending to console for simplicity
    the checkout array can be visible on - "/checkouts" route. If the checkout status gets changed to ordered, the process will 
    be stopped and no messages will be sent to user.
  */
  abandonedCheckouts.forEach((checkout) => {
    if (checkout.status === "pending") {
      reminders.forEach((reminder, reminderIndex) => {
        const messageSent = checkout.messagesSent[reminderIndex];
        const timeSinceCreated = moment(now).diff(checkout.createdAt);
        if (!messageSent && timeSinceCreated >= reminder.delay) {
          // Check if the user has placed an order
          const orderPlaced = abandonedCheckouts.some((c) => {
            return (
              c.customerId === checkout.customerId && c.status === "ordered"
            );
          });

          if (!orderPlaced) {
            // Simulate sending a message
            console.log(
              `Sending reminder to ${checkout.customerId ?? `guest`}: ${
                reminder.message
              }`
            );
            // Update the checkout with the sent message timestamp
            checkout.messagesSent[reminderIndex] = now;
          } else {
            // If an order is placed, update the status of the checkout
            checkout.status = "ordered";
            console.log("Product Ordered");
          }
        }
      });
    }
  });
}

// Check for abandoned checkouts every minute
cron.schedule('* * * * * *', checkAbandonedCheckouts);

// Route to display all checkouts and messages
app.get('/checkouts', (req, res) => {
  res.send({ checkouts: abandonedCheckouts });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
