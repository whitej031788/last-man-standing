function loginObj() {

  this.error = ko.observable('');
  this.email = ko.observable('');
  this.password = ko.observable('');

  this.login = function() {
    var self = this;

    self.error("");
    $.ajax({
      url: "/login-user",
      type: "POST",
      data: self.serializeLogin(),
      contentType: "application/json",
      dataType: "json",
      success: function(data) {
        if (data.success) {
          // Successful login
          window.location.href = "/main";
        } else {
          // Something went wrong, we need to show an error
          self.error("Something went wrong!");
          console.log(data);
        }
      },
      error: function(err) {
        // Something went wrong, we need to show an error
        self.error(err.responseText);
        console.log(err);
      },
      failure: function(err) {
        // Something went wrong, we need to show an error
        self.error("Something went wrong!");
        console.log(err);
      }
    });
  }
  this.serializeLogin = function() {
    var self = this;

    let obj = {};
    obj.password = self.password().trim();
    obj.email = self.email().trim();
    return JSON.stringify(obj);
  }
}

var myObj = new loginObj();
ko.applyBindings(myObj);