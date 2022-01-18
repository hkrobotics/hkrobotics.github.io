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

    



