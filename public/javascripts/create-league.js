function createLeagueObj() {
  this.error = ko.observable('');
  this.success = ko.observable('');
  this.name = ko.observable('');
  this.joinFee = ko.observable('');
  this.maxPlayers = ko.observable('');
  this.isPublic = ko.observable(false);
  this.selectedLeague = ko.observable('');
  this.joinCode = ko.observable('');
  this.leagueId = ko.observable('');
  this.userEmail = ko.observable(document.getElementById('userEmail').value);

  this.availableLeagues = ko.observableArray(['Premier League', 'Championship', 'La Liga']);

  this.createLeague = function() {
    var self = this;

    self.error('');
    self.success('');
    if (!self.name() || self.name().length < 5) {
      self.error('Please enter a league name, and it must be a name longer than 5 characters');
      return;
    }
    if (!self.joinFee()) {
      self.error('Please enter a joining fee');
      return;
    }
    if (!self.maxPlayers()) {
      self.error('Enter the maximum number of players');
      return;
    }

    self.openStripeCheckout();

    // $.ajax({
    //   url: "/create-league",
    //   type: "POST",
    //   data: self.serializeData(),
    //   contentType: "application/json",
    //   dataType: "json",
    //   success: function(data) {
    //     if (data.success) {
    //       self.success("Your league has been created, and you have been added to it.");
    //       self.leagueId(data.league_id);
    //       if (data.joinCode) {
    //         self.joinCode(data.joinCode);
    //       }
    //     } else {
    //       self.error('Something went wrong! Please contact support');
    //     }
    //     console.log(data);
    //   },
    //   error: function(err) {
    //     if (err.responseJSON && err.responseJSON.code == 11000) {
    //       self.error('A league with that name already exists. Please try another name');
    //        // Duplicate league name
    //     } else {
    //       self.error('Something went wrong! Please contact support');
    //     }
    //     console.log(err);
    //   },
    //   failure: function(err) {
    //     self.error('Something went wrong! Please contact support');
    //     console.log(err);
    //   }
    // });
  }

  this.serializeData = function() {
    let self = this;
    let obj = {};

    obj.name = self.name().trim();
    obj.joinFee = self.joinFee().trim();
    obj.maxPlayers = self.maxPlayers().trim();
    obj.isPublic = self.isPublic();
    obj.league = self.selectedLeague().trim().replace(/\s+/g, '-').toLowerCase();

    return JSON.stringify(obj);
  }

  this.openStripeCheckout = function() {
    let self = this;
    // Open Checkout with further options:
      handler.open({
        name: 'Last Man Standing',
        description: 'You have to pay the entrance fee',
        currency: 'gbp',
        amount: self.joinFee() * 100,
        email: "sam@paddle.com" //self.email()
      });
    e.preventDefault();
  }
}

var handler = StripeCheckout.configure({
  key: 'pk_test_qHPmRmiktz9ipePqMmOwwAz5',
  image: 'https://stripe.com/img/documentation/checkout/marketplace.png',
  locale: 'auto',
  token: function(token) {
    // You can access the token ID with `token.id`.
    // Get the token ID to your server-side code for use.
  }
});

let newObj = new createLeagueObj();
ko.applyBindings(newObj, $('.container.child')[0]);