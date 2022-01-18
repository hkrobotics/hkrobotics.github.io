function change_img(mode) {
    var myImg = document.getElementById('hero_img');


    
    

    const dark_img = './assets/images/hero_img_dark.png';
    const light_img = './assets/images/hero_img_light.png';


    console.log(myImg.getAttribute('src'),mode);
    // if(myImg.getAttribute('src') != dark_img){
    //     refreshImage('hero_img', dark_img);
        
    // }
    if(mode == 'dark'){
        refreshImage('hero_img', dark_img);
        
    }
    else{
        refreshImage('hero_img', light_img);
        
    }

    
    // if(mode == 'dark'){
    //     refreshImage('hero_img', dark_img);
    //     localStorage.setItem('storedImg', dark_img)
    // }
    // else{
    //     refreshImage('hero_img', light_img);
    //     localStorage.setItem('storedImg', light_img)
    // }
    

    function refreshImage(imgElement, imgURL){    
        // create a new timestamp 
        var timestamp = new Date().getTime();  
      
        var el = document.getElementById(imgElement);  
      
        // var queryString = "?t=" + timestamp;    
       
        el.src = imgURL; /*+ queryString;*/    
    }  
}