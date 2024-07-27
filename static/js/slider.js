const navToggle = document.getElementById('navToggle');

// Get the navigation elements
const navButtons = document.querySelectorAll('.nav-button, .nav-button2');
const photoLevel1 = document.querySelector('.photo-level-1');
const pictureChangeL2 = document.querySelector('.picture-change-l2');
let photoLevel1_padding = photoLevel1.style.padding;
let photoLevel1_width = photoLevel1.style.width;

let image_picture = document.querySelector('.expanded-post-content img');
const image_margin = image_picture.style.margin;
const image_max_width = image_picture.style.maxWidth;
const image_max_height = image_picture.style.maxHeight;


// const image_margin = "0 2px";
// const image_max_width = "95%";
// const image_max_height = "calc(91dvh - 50px)";

// Function to update navigation visibility
function updateNavVisibility(isVisible) {
    const display = isVisible ? 'flex' : 'none';
    photoLevel1.style.justifyContent = isVisible ? 'space-between' : 'center';
    photoLevel1.style.width = isVisible ? photoLevel1_width : '100%';
    photoLevel1.style.padding = isVisible ? photoLevel1_padding : '0';
    navButtons.forEach(btn => btn.style.display = display);
    pictureChangeL2.style.display = display;
    

    image_picture = document.querySelector('.expanded-post-content img')
    image_picture.style.margin = isVisible ? image_margin : '0 auto';
    image_picture.style.maxWidth = isVisible ? image_max_width : '100%';
    image_picture.style.maxHeight = isVisible ? image_max_height : '91vh';
    
}


function update_visibility_wrapped()
{

    const cachedState = localStorage.getItem('navToggleState');
    if (cachedState !== null) 
        {
            navToggle.checked = cachedState === 'true';
            updateNavVisibility(navToggle.checked);
        }
}

// Check cached state on page load
document.addEventListener('DOMContentLoaded', update_visibility_wrapped );

// Add event listener for toggle changes
navToggle.addEventListener('change', () => {
  updateNavVisibility(navToggle.checked);
  localStorage.setItem('navToggleState', navToggle.checked);
});