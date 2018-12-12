function navBar() {
    this.activeNav = ko.observable(window.location.pathname.replace(/\//g, ''));
}

let nav = new navBar();
ko.applyBindings(nav, document.getElementById('lmsNavBar'));