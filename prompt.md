I am opening an Indian Authentic Home made Food Delivery service.
 its a Home Kitchen name "Harshly Kitchen" for that I need a one page fully functional single page mobile responsive website site with
* 4 Tile for (Veg Thali , Veg Special Thali, Veg Deluxe Thali) 
* Price Tag (149Rs , 199 Rs, 249 Rs)
* Bhai, Delivery Free Hai " In BOLD & BIGGER TEXT
* Time HIGHLIGHT 8pm to 10PM
* Order Taken before 3 PM - Daily
* NAME: Harshly Kitchen (8351801349)
* Provide Add to Cart for 
* Make it Mini EComm site for Order placement with Cart + Checkout 
* Checkout should ask Customer Email / Name/ Mobile
* Add Indian Authentic Home Food Thali Image from web & hindi font style to be used. Everything in Hindi Fonts.
* On click of Place order button,  the Payment flow should be invoked and once user pay for order , I should be able to send order details tank you email to customer. I need this all for Indian market

BUSINESS THEME : Home Food / Small Town / Mostly Village vibes.
TYPOGRAPHY : Simple yet Appealing.

Clean data flow all the way through:
Checkout Form Profile - Cart Amount and seek input (name + email) ↓ 
Auto-prefill into Razorpay — the name and email the buyer enters get passed directly into the Razorpay checkout's prefilled field, so they don't have to type it again inside the checkout modal.
validated Razorpay checkout opens (prefilled) ↓
payment success verifyAndDeliver({ ...razorpayResponse, name, email }) ↓ 
POST /api/verify-payment → signature check → send email to buyer.email ↓ 
Success modal shows the exact email address used.

Client-side validation that runs before anything else:
Empty name → red border + inline error message
Missing or malformed email → same
Errors clear as soon as the user starts typing
Razorpay checkout won't open until both fields are valid
Tech : RazorPay/ React / npm server
