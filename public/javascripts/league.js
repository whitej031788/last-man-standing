function leagueObj() {
  this.privLeagueCode = ko.observable('');
  this.leagueId = ko.observable(document.getElementById('myLeagueId').value);
  this.error = ko.observable('');
  this.success = ko.observable('');
  this.userEmail = ko.observable(document.getElementById('userEmail').value);
  this.weekSelection = ko.observable('');
  // this.matchdaySelect = ko.observable(parseInt(document.getElementById('matchDay').value));
  // this.currentMatchWeek = ko.observable(parseInt(document.getElementById('matchDay').value));
  this.currentMatches = ko.observableArray();

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

  this.getLeagueByMatchWeek = function(matchWeek) {
    let self = this;
    $.ajax({
      url: "/get-matches-by-week",
      type: "POST",
      data: JSON.stringify({week: matchWeek}),
      contentType: "application/json",
      dataType: "json",
      success: function(data) {
        if (data.success) {
          self.currentMatches(data.matches);
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

  this.nextPage = function() {
    let self = this;

    self.currentMatchWeek(self.currentMatchWeek() + 1);
    self.getLeagueByMatchWeek(self.currentMatchWeek());
  }

  this.prevPage = function() {
    let self = this;

    self.currentMatchWeek(self.currentMatchWeek() - 1);
    self.getLeagueByMatchWeek(self.currentMatchWeek());
  }

  this.makePick = function(type) {
    let myTeam = this[type];
    window.knockoutObj.weekSelection(myTeam);
    // self.matchdaySelect(matchday);
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

  // this.getLeagueByMatchWeek(this.matchdaySelect());
}

let myObj = new leagueObj();
window.knockoutObj = myObj;
ko.applyBindings(myObj, $('.container.child')[0]);