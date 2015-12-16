# Call tracking demo
SMS Auto Reply with BXML

# Ngrok
Setup [ngrok](https://ngrok.com/)  Download ngrok if you have not already. Ngrok is a handy tool that provides an external URL to map to localhost:port. 

The application defaults to port 5000, so launch ngrok http mapping to port 5000:

```ngrok http 5000```

Be sure to copy the forwarding ngrok url, we’ll need that later to configure the application

# Modify bandwidth.json
User creds and baseURL and specified in a json file <bandwidth.json>. Be sure to update the values provided by Bandwidth and ngrok. 

* userId — UserID from Bandwidth
* apiToken — API Token from Bandwidth
* apiSecret — API Secret from Bandwidth
* baseUrl — ngrok url (from above)

# Install and Run
The app is written in node, so following normal conventions just run:

```npm install```

```npm start```

# Send message to number