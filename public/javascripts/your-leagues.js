function yourLeagues() {
    this.goToLeague = function(id) {
        window.location.href = "/league/" + id;
    }
}

let myObj = new yourLeagues();
ko.applyBindings(myObj, $('.container.child')[0]);