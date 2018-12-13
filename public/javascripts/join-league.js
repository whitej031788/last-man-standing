function joinObj() {
  this.error = ko.observable('');
  this.userEmail = ko.observable(document.getElementById('userEmail').value);
  this.isSubmitting = ko.observable(false);

  this.joinLeague = function(lId, joinFee) {
      let self = this;
  
      let stripe = StripeCheckout.configure({
        key: 'pk_test_MZc2ZHP9BRdzyj5Ak8SynFUr',
        locale: 'auto',
        token: function(token) {
  
          console.log(token)
          window.knockoutObj.isSubmitting(true);
          // You can access the token ID with `token.id`.
          // Get the token ID to your server-side code for use.
            $.ajax({
            url: "/stripePayment",
            type: "POST",
            data: JSON.stringify({amount: joinFee, stripeToken: token.id}),
            contentType: "application/json",
            dataType: "json",
            success: function(data) {
              if (data.success) {
                window.knockoutObj.postLeagueData(lId);
              }
            },
            error: function(err) {
              console.log(err);
            },
            failure: function(err) {
              console.log(err);
            }
          });
        }
      });
  
      // Open Checkout with further options:
      stripe.open({
        name: 'Must Win',
        description: 'You have to pay the entrance fee',
        currency: 'gbp',
        amount: joinFee * 100,
        email: self.userEmail()
      });
    }

    this.postLeagueData = function(lId) {
    let self = this;
    self.error('');
    $.ajax({
      url: "/join-league",
      type: "POST",
      data: JSON.stringify({leagueId: lId}),
      contentType: "application/json",
      dataType: "json",
      success: function(data) {
        if (data.success) {
          alert("You have successfully joined the league!");
          window.location.href = "/league/" + lId;
        } else {
          self.error("That code is not correct, or you don't have permission to join this league");
        }
        console.log(data);
      },
      error: function(err) {
        self.error(err.responseText);
        console.log(err);
      },
      failure: function(err) {
        self.error('Something went wrong! Please contact support');
        console.log(err);
      }
    });    
  }
}

let myObj = new joinObj();
ko.applyBindings(myObj, $('.container.child')[0]);
window.knockoutObj = myObj;