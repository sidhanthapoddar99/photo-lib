const grid = document.querySelector('.grid');
const expandedPost = document.getElementById('expanded-post');
const expandedPostContent = document.querySelector('.expanded-post-content');
const closeButton = document.querySelector('.close-button');
const prevButton = document.querySelector('.prev-button');
const nextButton = document.querySelector('.next-button');


const imageCounter = document.querySelector('.image-counter');
let currentImageIndex = 0;
let totalImages = 0;
let image_array = [];


prevButton.addEventListener('click', () => navigatePost(-1));
nextButton.addEventListener('click', () => navigatePost(1));


function set_image(imaage_no){

    imgContainer = image_array[imaage_no];
    expandedPostContent.innerHTML = '';
    expandedPostContent.appendChild(imgContainer);
    console.log("called");

}


function fetchAndDisplayPost(postId) {
    fetch(`/api/posts/${postId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(post => {
            
            totalImages = post.images.length;
            currentImageIndex = 0;
                        
            post.images.forEach((image, index) => {

                const imgContainer = document.createElement('div');                
                const img = document.createElement('img');
                img.src = `/static/posts/${post.id}/${image}`;
                img.style.objectFit = 'contain';
                imgContainer.appendChild(img);
                // image_array.push(imgContainer);
                image_array.push(img);
                set_image(0)
            });

            updateImageCounter();
            expandedPost.style.display = 'flex';
        })
        .catch(error => {
            console.error('Failed to fetch post:', error);
        });
}



function updateImageCounter() {
    imageCounter.textContent = `${currentImageIndex + 1}/${totalImages}`;
}

function navigatePost(direction) {


    currentImageIndex += direction;
    currentImageIndex = currentImageIndex < 0 ? totalImages - 1 : currentImageIndex % totalImages;
    // Update current image index
    set_image(currentImageIndex)
    updateImageCounter();
}

// Add this to the existing scroll event listener or create a new one
expandedPostContent.addEventListener('scroll', () => {
    const itemWidth = expandedPostContent.offsetWidth;
    currentImageIndex = Math.round(expandedPostContent.scrollLeft / itemWidth);
    updateImageCounter();
});

// mobile swipe


let touchStartX = 0;
let touchEndX = 0;

expandedPostContent.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

expandedPostContent.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50; // Minimum distance for a swipe
    if (touchEndX < touchStartX - swipeThreshold) {
        navigatePost(1); // Swipe left, go to next
    } else if (touchEndX > touchStartX + swipeThreshold) {
        navigatePost(-1); // Swipe right, go to previous
    }
}


// scroll left and right

let scrollStartX = 0;
let scrollEndX = 0;
let isScrolling = false;
let lastNavigationTime = 0;
const navigationCooldown = 500; // 500ms cooldown between navigations

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}




// Add mouse wheel event listener
expandedPostContent.addEventListener('wheel', handleMouseScroll);




// Add mousedown and mouseup event listeners to track horizontal scrolling
expandedPostContent.addEventListener('mousedown', (e) => {
    scrollStartX = e.clientX;
    isScrolling = true;
});

document.addEventListener('mouseup', () => {
    if (isScrolling) {
        handleSwipe();
        isScrolling = false;
    }
});

document.addEventListener('mousemove', (e) => {
    if (isScrolling) {
        scrollEndX = e.clientX;
    }
});

// Add debounced mouse wheel event listener
expandedPostContent.addEventListener('wheel', debounce(handleMouseScroll, 50));


function handleMouseScroll(e) {
    e.preventDefault();
    const currentTime = new Date().getTime();
    
    if (currentTime - lastNavigationTime > navigationCooldown) {
        if (e.deltaX > 0) {
            navigatePost(1);
        } else if (e.deltaX < 0) {
            navigatePost(-1);
        }
        lastNavigationTime = currentTime;
    }
}
