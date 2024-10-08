
src_list = ["https://www.youtube.com/watch?v=gLs1ML3XOlE&list=PLJPbj8xFD1eM96jaxpnAVNqfHRYrqdB4B&pp=gAQBiAQB8AUB",
  "https://www.youtube.com/watch?v=8CwB4T1nkaM&list=PL0ORmUX32ARCg0wl_ho7hJK1sVEuxx6oF&pp=gAQBiAQB8AUB",
  "https://open.spotify.com/playlist/37i9dQZF1DWWjGdmeTyeJ6",
  "https://open.spotify.com/playlist/37i9dQZEVXbqecL6jGt8wJ",
  "https://www.radio.it/s/jazz24&data-autoplay=true"
];

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

$( document ).ready(function() {
    console.log( "ready!" );
    picked = src_list[getRndInteger(0,src_list.length)];
    window.open(picked,"_self");
});