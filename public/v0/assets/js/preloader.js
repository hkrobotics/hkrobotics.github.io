//function to get rid of preloader

window.addEventListener("load", () => {
  // const preloader = document.querySelector('.loader');
  const loader = document.getElementById("loader");
  loader.classList.add("fadeOut");
});
