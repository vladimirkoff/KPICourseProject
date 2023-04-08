'use strict';

if(!localStorage.getItem('money')) {
       document.querySelector('.money').innerHTML = '0';
       localStorage.setItem('money', 0);
} else {
       document.querySelector('.money').innerHTML = localStorage.getItem('money');
}

window.addEventListener('storage', () => {
       document.querySelector('.money').innerHTML = localStorage.getItem('money');
})
