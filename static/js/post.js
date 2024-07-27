// import {  updateNavVisibility } from "./slider";

// DOM elements
const expandedPost = document.getElementById('expanded-post');
const expandedPostContent = document.querySelector('.expanded-post-content');
const closeButton = document.querySelector('.close-button');
const prevButton = document.querySelector('.prev-button');
const nextButton = document.querySelector('.next-button');
const nextPostButton = document.querySelector('.next-picture');
const prevPostButton = document.querySelector('.prev-picture');
const imageCounter = document.querySelector('.image-counter');

// State variables
let currentImageIndex = 0;
let totalImages = 0;
let imageArray = [];
let currentPostId = 0;

// Constants
const SWIPE_THRESHOLD = 50;
const NAVIGATION_COOLDOWN = 500;

// Event listeners
prevButton.addEventListener('click', () => navigatePost(-1));
nextButton.addEventListener('click', () => navigatePost(1));
prevPostButton.addEventListener('click', () => changePost(1));
nextPostButton.addEventListener('click', () => changePost(-1));
expandedPostContent.addEventListener('touchstart', handleTouchStart);
expandedPostContent.addEventListener('touchend', handleTouchEnd);
expandedPostContent.addEventListener('wheel', debounce(handleMouseScroll, 50));
expandedPostContent.addEventListener('mousedown', handleMouseDown);
document.addEventListener('mouseup', handleMouseUp);
document.addEventListener('mousemove', handleMouseMove);

// Touch events variables
let touchStartX = 0;
let touchStartY = 0;

// Mouse events variables
let isScrolling = false;
let scrollStartX = 0;
let lastNavigationTime = 0;

function setImage(imageIndex) {
    expandedPostContent.innerHTML = '';
    expandedPostContent.appendChild(imageArray[imageIndex]);
    updateImageCounter();
    update_visibility_wrapped();

}

function changePost(direction) {
    fetch(`/api/all_posts_list/${currentPostId}`)
        .then(response => response.json())
        .then(post => {
            const nextPostId = direction === 1 ? post.next : post.prev;
            if (nextPostId !== currentPostId) {
                window.location.href = `/posts/${nextPostId}`;
            } else {
                console.log("No more posts available");
            }
        })
        .catch(error => console.error('Failed to fetch post:', error));
}

function fetchAndDisplayPost(postId) {
    fetch(`/api/posts/${postId}`)
        .then(response => response.json())
        .then(post => {
            totalImages = post.images.length;
            currentImageIndex = 0;
            currentPostId = postId;
            imageArray = post.images.map(image => {
                const img = document.createElement('img');
                img.src = `/static/${volt_name}/${post.id}/${image}`;
                img.style.objectFit = 'contain';
                return img;
            });
            setImage(0);
            expandedPost.style.display = 'flex';
        })
        .catch(error => console.error('Failed to fetch post:', error));
}

function updateImageCounter() {
    imageCounter.textContent = `${currentImageIndex + 1}/${totalImages}`;
}

function navigatePost(direction) {
    currentImageIndex = (currentImageIndex + direction + totalImages) % totalImages;
    setImage(currentImageIndex);
}

function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}

function handleTouchEnd(e) {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
            navigatePost(deltaX > 0 ? -1 : 1);
        }
    } else {
        if (Math.abs(deltaY) > SWIPE_THRESHOLD) {
            changePost(deltaY > 0 ? 1 : -1);
        }
    }
}

function handleMouseDown(e) {
    scrollStartX = e.clientX;
    isScrolling = true;
}

function handleMouseUp() {
    if (isScrolling) {
        isScrolling = false;
    }
}

function handleMouseMove(e) {
    if (isScrolling) {
        const deltaX = e.clientX - scrollStartX;
        if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
            navigatePost(deltaX > 0 ? -1 : 1);
            isScrolling = false;
        }
    }
}

function handleMouseScroll(e) {
    e.preventDefault();
    const currentTime = Date.now();
    
    if (currentTime - lastNavigationTime > NAVIGATION_COOLDOWN) {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
            navigatePost(e.deltaX > 0 ? 1 : -1);
        } else {
            changePost(e.deltaY > 0 ? -1 : 1);
        }
        lastNavigationTime = currentTime;
    }
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}