const grid = document.querySelector('.grid');
const expandedPost = document.getElementById('expanded-post');
const expandedPostContent = document.querySelector('.expanded-post-content');
const closeButton = document.querySelector('.close-button');
const prevButton = document.querySelector('.prev-button');
const nextButton = document.querySelector('.next-button');

grid.addEventListener('click', (e) => {
    const post = e.target.closest('.post');
    if (post) {
        const postId = post.dataset.postId;
        fetchAndDisplayPost(postId);
    }
});

closeButton.addEventListener('click', () => {
    expandedPost.style.display = 'none';
});

prevButton.addEventListener('click', () => navigatePost(-1));
nextButton.addEventListener('click', () => navigatePost(1));


function fetchAndDisplayPost(postId) {
    fetch(`/api/posts/${postId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(post => {
            expandedPostContent.innerHTML = '';
            post.images.forEach(image => {
                const imgContainer = document.createElement('div');
                imgContainer.style.flex = '0 0 100%';
                imgContainer.style.scrollSnapAlign = 'start';
                
                const img = document.createElement('img');
                img.src = `/static/posts/${post.id}/${image}`;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'contain';
                
                imgContainer.appendChild(img);
                expandedPostContent.appendChild(imgContainer);
            });

            expandedPost.style.display = 'flex';
        })
        .catch(error => {
            console.error('Failed to fetch post:', error);
        });
}

// function navigatePost(direction) {
//     const currentScroll = expandedPostContent.scrollLeft;
//     const itemWidth = expandedPostContent.offsetWidth;
//     const targetScroll = currentScroll + direction * itemWidth;
    
//     expandedPostContent.scrollTo({
//         left: targetScroll,
//         behavior: 'smooth'
//     });
// }


function navigatePost(direction) {
    const currentScroll = expandedPostContent.scrollLeft;
    const itemWidth = expandedPostContent.offsetWidth;
    let targetScroll = currentScroll + direction * itemWidth;

    // Ensure we don't scroll beyond the content
    const maxScroll = expandedPostContent.scrollWidth - itemWidth;
    targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));

    expandedPostContent.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
    });
}



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


// Vr joysticks

let joystickX = 0;

function updateVRControls(frame) {
    if (frame.inputSources && frame.inputSources.length) {
        const gamepad = frame.inputSources[0].gamepad;
        if (gamepad && gamepad.axes.length >= 2) {
            joystickX = gamepad.axes[0]; // Assuming X-axis is the first axis
        }
    }
}

function handleVRNavigation() {
    const joystickThreshold = 0.5; // Threshold for joystick movement
    if (joystickX > joystickThreshold) {
        navigatePost(1); // Move right
    } else if (joystickX < -joystickThreshold) {
        navigatePost(-1); // Move left
    }
}

// This function should be called in your VR animation loop
function vrAnimationLoop() {
    // Your existing VR rendering code here
    
    // Update VR controls
    const frame = // Get the current VR frame
    updateVRControls(frame);
    handleVRNavigation();
    
    // Continue the animation loop
    requestAnimationFrame(vrAnimationLoop);
}

// Start the VR animation loop when entering VR mode
function onVRDisplayPresentChange() {
    if (this.isPresenting) {
        vrAnimationLoop();
    }
}

// Add event listener for VR presentation change
if (navigator.xr) {
    navigator.xr.addEventListener('sessionstart', onVRDisplayPresentChange);
} else if (navigator.getVRDisplays) {
    window.addEventListener('vrdisplaypresentchange', onVRDisplayPresentChange);
}