function signInObj() {
    let self = this;
    this.error = ko.observable('');
    this.regEmail = ko.observable('');
    this.fullName = ko.observable('');
    this.regPass = ko.observable('');
    this.regPassConf = ko.observable('');
    this.TOC = ko.observable(false);

    this.submitRegistration = function() {
      var self = this;

      self.error('');
      if (!self.TOC()) {
        self.error('Please accept our terms and conditions');
        return;
      }
      if (!self.fullName()) {
        self.error('Enter your name');
        return;
      }
      if (!self.regEmail()) {
        self.error('Enter your email');
        return;
      }
      if (!self.regPass()) {
        self.error('Fill out a password');
        return;
      }
      if (self.regPass() !== self.regPassConf()) {
        self.error('Passwords do not match');
        return;
      }
      $.ajax({
        url: "/create-user",
        type: "POST",
        data: self.serializeReg(),
        contentType: "application/json",
        dataType: "json",
        success: function(data) {
          alert('Your account has been created! You will now be redirected to the dashboard');
          setTimeout(function() {
            window.location.href = "/main";
          }, 200);
        },
        error: function(err) {
          self.error('Something went wrong! Please contact support');
          console.log(err);
        },
        failure: function(err) {
          self.error('Something went wrong! Please contact support');
          console.log(err);
        }
      });
    }
    this.serializeReg = function() {
      let obj = {};
      obj.passwordConf = self.regPassConf().trim();
      obj.password = self.regPass().trim();
      obj.email = self.regEmail().trim();
      obj.name = self.fullName().trim();
      return JSON.stringify(obj);
    }
  }
  let newObj = new signInObj();
  ko.applyBindings(newObj);