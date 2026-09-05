## all routes --

### Client auth Routes-

1.  /register - checks user's farmerID or aadharID based on user input in the databse, user only needs to put either thier farmerID or thier aadhar ID, if the ID does not exist means the user is not a farmer or the entered data is incorrect, if it exists then we generate and save the otp in the databse and the otp expires in 5 minutes.

2.  /verify-otp - then the user enters the otp he recives and if the otp matches the one stored in the databse with the user's phoneNumber then we create a token, we  move to next Page.

3.  /me - after the user closes the app, the data is stored in the local storage of the browser here in app similar thing, and when he opens the app again and then /me is called to automatically authenticate the user without needing to login again
