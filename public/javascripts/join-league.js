function joinObj() {
  this.error = ko.observable('');
  this.userEmail = ko.observable(document.getElementById('userEmail').value);
  this.isSubmitting = ko.observable(false);

  this.joinLeague = function(lId) {
      window.knockoutObj.isSubmitting(true);
      window.knockoutObj.postLeagueData(lId);
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
          self.isSubmitting(false);
          if (data.success) {
            alert("You have successfully joined the league!");
            window.location.href = "/league/" + lId;
          } else {
            self.error("That code is not correct, or you don't have permission to join this league");
          }
          console.log(data);
        },
        error: function(err) {
          self.isSubmitting(false);
          self.error(err.responseText);
          console.log(err);
        },
        failure: function(err) {
          self.isSubmitting(false);
          self.error('Something went wrong! Please contact support');
          console.log(err);
        }
      });    
  }
}

let myObj = new joinObj();
ko.applyBindings(myObj, $('.container.child')[0]);
window.knockoutObj = myObj;