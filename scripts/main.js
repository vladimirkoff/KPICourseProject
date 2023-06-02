'use strict';

if(!localStorage.getItem('money')) {
       document.querySelector('.money').innerHTML = '1000';
       localStorage.setItem('money', 1000);
} else {
       document.querySelector('.money').innerHTML = localStorage.getItem('money');
}

window.addEventListener('storage', () => {
       document.querySelector('.money').innerHTML = localStorage.getItem('money');
});

