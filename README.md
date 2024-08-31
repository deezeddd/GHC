## GHC Assignment


  - Utilized Shopify webhook "Checkout creation"
  - Used ngrok for tunneling HTTP to HTTPS
  - Used express to build REST APIs

#### To start the project
       npm i
       npm start
       npx ngrok http 3000  //(on another terminal)

  ngrok will provide an HTTPS link, which should be included in the Shopify webhook.
  and following tests can be done.

  GET /checkouts - can be done to look for the abandonedCheckout list which will provide the details about the checkout
  POST /checkout - used for shopify webhook.
  
       
