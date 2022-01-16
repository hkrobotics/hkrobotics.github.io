var checkbox = document.querySelector('input[name=theme_switch_chk]')
var mode = localStorage.getItem('mode')

if (mode == 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark')
    checkbox.checked = true
}

checkbox.addEventListener('change', function () {
    if (this.checked) {
      
        document.documentElement.setAttribute('data-theme', 'dark')
        localStorage.setItem('mode', 'dark')
    } else {
      
        document.documentElement.setAttribute('data-theme', 'light')
        localStorage.setItem('mode', 'light')
    }
})

    

    // var myImg = document.getElementById('hero_img');
    // console.log(myImg.getAttribute('src'));
    // if(mode == 'dark'){
    //     refreshImage('hero_img', './assets/images/hero_img_dark.png');
    // }
    // else{
    //     refreshImage('hero_img', './assets/images/hero_img_light.png');
    // }

    // function refreshImage(imgElement, imgURL){    
    //     // create a new timestamp 
    //     var timestamp = new Date().getTime();  
      
    //     var el = document.getElementById(imgElement);  
      
    //     var queryString = "?t=" + timestamp;    
       
    //     el.src = imgURL + queryString;    
    // }  


