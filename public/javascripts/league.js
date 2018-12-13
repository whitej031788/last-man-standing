function leagueObj() {
  this.privLeagueCode = ko.observable('');
  this.leagueId = ko.observable(document.getElementById('myLeagueId').value);
  this.error = ko.observable('');
  this.success = ko.observable('');
  this.userEmail = ko.observable(document.getElementById('userEmail').value);
  this.weekSelection = ko.observable('');
  this.matchdaySelect = ko.observable();

  this.joinLeaguePriv = function() {
    let self = this;

    $.ajax({
      url: "/join-league",
      type: "POST",
      data: JSON.stringify({joinCode: self.privLeagueCode(), leagueId: self.leagueId()}),
      contentType: "application/json",
      dataType: "json",
      success: function(data) {
        if (data.success) {
          alert("You have successfully joined the league!");
          window.location.reload();
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

  this.makePick = function(team, matchday) {
    let self = this;

    self.weekSelection(team);
    self.matchdaySelect(matchday);
    $("#confirmSelect").modal();
  }

  this.confirmPick = function() {
    let self = this;
    $("#confirmSelect").modal('toggle');
    $.ajax({
      url: "/make-pick",
      type: "POST",
      data: JSON.stringify({team: self.weekSelection(), matchDay: self.matchdaySelect(), leagueId: self.leagueId()}),
      contentType: "application/json",
      dataType: "json",
      success: function(data) {
        if (data.success) {
          alert("Your pick has been recorded. Good luck!");
          window.location.reload();
        } else {
          self.error("An error occurred");
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

let myObj = new leagueObj();
ko.applyBindings(myObj, $('.container.child')[0]);