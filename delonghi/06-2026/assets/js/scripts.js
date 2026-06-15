(function () {
  function initRecipeTabs(tabs) {
    var tabButtons = tabs.querySelectorAll('.recipe-tabs__tab');
    var panels = tabs.querySelectorAll('.recipe-tabs__panel');

    function activate(button) {
      var targetId = button.getAttribute('aria-controls');

      tabButtons.forEach(function (btn) {
        var isActive = btn === button;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      panels.forEach(function (panel) {
        var isActive = panel.id === targetId;
        panel.classList.toggle('is-active', isActive);
        panel.hidden = !isActive;
      });
    }

    tabButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        activate(button);
      });
    });
  }

  document.querySelectorAll('.recipe-tabs').forEach(initRecipeTabs);
})();
