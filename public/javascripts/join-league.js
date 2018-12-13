function joinObj() {
  this.error = ko.observable('');
  this.joinLeague = function(lId) {
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