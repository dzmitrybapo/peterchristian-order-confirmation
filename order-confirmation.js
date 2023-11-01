//COLLECTING GUEST EMAIL SO WE CAN USE IT ON ORDER CONFIRMATION
console.log("GDPR");
if(window.location.href.indexOf("/checkout") >= 0 && window.location.href.indexOf("order-confirmation") == -1){
	let email_saved = "";
	console.log("We on checkout!");
	$(document).bind('DOMSubtreeModified', async () => {
		if($(".checkout-step--customer .optimizedCheckout-contentPrimary[data-test='customer-info']").length > 0 && 
			(email_saved == "" || $(".checkout-step--customer .optimizedCheckout-contentPrimary[data-test='customer-info']").text() != email_saved)){
			email_saved = $(".checkout-step--customer .optimizedCheckout-contentPrimary[data-test='customer-info']").text();
			localStorage.setItem("bapo_ck_email", email_saved);
			console.log("Guest email!", localStorage.getItem("bapo_ck_email"));
		}
		
		//Adding "(required)" to phone for visibility
		if($("#phoneInput-label").length > 0 && $("#phoneInput-label").text().indexOf("required") == -1){
			$("#phoneInput-label").append(" (required)");
		}
		
		//Tweaking the appearance of Coupons per PC request
		if($("#redeemable-collapsable").length > 0 && $("#redeemable-header").length == 0){
			$("#redeemable-collapsable .form-field").prepend("<h2 id='redeemable-header'>Promotion Code</h2>");
			$("#redeemable-collapsable input").attr("placeholder", "Enter a promotion code");
			$(".redeemable-label").hide();
		}
	});
}

//ORDER CONFRIMATION GDPR FORM
if(window.location.href.indexOf("/checkout/order-confirmation") >= 0){
	let form_added = false;
	console.log(">>", $(".orderConfirmation-section strong").first().text());
	$(document).bind('DOMSubtreeModified', async () => {
		setTimeout(() => {
			if($(".orderConfirmation-section").length > 0 && !form_added){
				form_added = true;
				console.log($(".orderConfirmation-section"));
				$(".orderConfirmation-section").append('<div style="color:#292929;font-family:\'Open Sans\',\'Helvetica Neue\',Arial,sans-serif;background-color:#2421381A!important;padding:1rem!important"> <div> <div> <h6 style="font-weight:600;font-size:1.2rem;margin:0">To help us improve our service, please tell us how you came across our website today.</h6> <select id="gdpr1" style="margin:1rem 0"> <option value="" selected="selected">Please select an option</option> <option value="EMAIL">Received an Email</option> <option value="INTSEARCH">Internet Search</option> <option value="WEBLINK">Link from another website</option> <option value="MAGAZINE">Magazine Advertisement</option> <option value="NEWSPAPER">Newspaper Advertisement</option> <option value="CATALOGUE">Received a Catalogue</option> <option value="RF">Recommended by a friend</option> <option value="RB">Returning Customer</option> <option value="OTHER">Other</option> </select> </div><div> <h6 style="font-weight:600;font-size:1.2rem;margin:0">Your Contact Preferences</h6> <p>As a valued customer we would like to keep you in the loop about exciting new product launches, sales and special offers. Please tick the boxes below if you would prefer not to receive these communications from Peter Christian</p><div><input id="gdpr2" type="checkbox" name="optin_post" style="position:relative;top:2px"><label for="optinCheckbox-optin_post"><span>&nbsp;Please don\'t send me promotional emails</span></label></div><div><input id="gdpr3" type="checkbox" name="optin_email" style="position:relative;top:2px"><label for="optinCheckbox-optin_email"><span>&nbsp;I don\'t want mailing from like minded retailers and charities</span></label></div></div><p>We trust that you enjoy receiving our catalogues, however if you would prefer not to, please email us on <strong><a href="mailto:helpdesk@peterchristian.co.uk">helpdesk@peterchristian.co.uk</a></strong> and we will update your preferences.<br><br>Your data is important so we\'ll always treat it with respect. For more information see our <a href="/privacy-cookies/" target="_blank">privacy policy.</a><br>You will be redirected back to the home page in<b class="countdown"></b>.<br><br></p></div><div><button class="btwsubmit" type="submit" style="background-color:#504d60!important;border-color:#504d60!important;color:#f5bb47!important;padding:.5rem 2rem;width:100%;font-weight:bold;" onclick="submitGDPR()">Submit</button></div></div>');
			}
		}, 100);
	});
	
	function submitGDPR(){
		let order_num = $("[data-test=order-confirmation-order-number-text] strong").text();
		let store_hash = '2fhihzl616';
		let email = '{{ customer.email }}';
		let local_email = localStorage.getItem("bapo_ck_email");
		if(email == "" || local_email != ""){
			email = local_email;
		}
		
		if(email != ""){
			$(".btwsubmit").text("Submitting...");
			$.ajax({
				type: "POST",
				url: "https://lambda.ribon.ca/"+store_hash+"/funnel/setgdpr",
				data: {
					entity_id: order_num + '-order-' + store_hash,
					entity_type: 'order',
					store_hash: store_hash,
					noemail: $("#gdpr2").is(':checked').toString(),		//"don't send emails" is checked
					norent: $("#gdpr3").is(':checked').toString(),		//"no mailing from retailers" is checked
					nomails: true,										//no mails is default
					heardsource: $("#gdpr1").val(),
					email: email,
					order_id: order_num,
					gdpr: true
				},
				complete: function() {				
					alert("Thank you!");
					localStorage.removeItem("bapo_ck_email");
					window.location = '/';
				}
			});
		}else{
			alert("Sorry, couldn't find your contact email or you already filled out the application.", email);
		}
	}
	
	let timertxt = "15:00";
	let interval = setInterval(function() {
		let timer = timertxt.split(':');
		let minutes = parseInt(timer[0], 10);
		let seconds = parseInt(timer[1], 10);
		seconds--;
		
		minutes = (seconds < 0) ? --minutes : minutes;
		if (minutes < 0){
			window.location = '/';
			clearInterval(interval);
		}
		seconds = (seconds < 0) ? 59 : seconds;
		seconds = (seconds < 10) ? '0' + seconds : seconds;
		$('.countdown').html(minutes + ':' + seconds);
		timertxt = minutes + ':' + seconds;
	}, 1000);
}