window.onload = function() {
  const hamburger = document.querySelector(".hamburger");
  const mobileMenu = document.querySelector(".mobile-menu");
  const closeButton = document.querySelector(".close-button");
  let menuIsOpen = false;
  hamburger.addEventListener("click", toggleMenu);
  closeButton.addEventListener("click", toggleMenu);

  function toggleMenu() {
    if (!menuIsOpen) {
      mobileMenu.classList.add("mobile-menu-display");
      closeButton.classList.add("mobile-menu-display");
      hamburger.classList.add("remove-hamburger")
    } else {
      mobileMenu.classList.remove("mobile-menu-display");
      closeButton.classList.remove("mobile-menu-display");
      hamburger.classList.remove("remove-hamburger")
    }

    menuIsOpen = !menuIsOpen;
  }
};
