// Importing utility function for preloading images
import { preloadImages } from './utils.js';

// Selecting DOM elements
const workNav = document.querySelector('.frame__works');
const workLinks = [...workNav.querySelectorAll('a')];

const title = document.querySelector('.frame__title-main');
const bgImageElements = [...document.querySelectorAll('.background__image')];
const video = document.querySelector('.background__video');

// Function to calculate clip-path values based on the direction attribute
const getClipPath = imageElement => { 
  // Maps direction to corresponding polygon values for clip-path animation
  const clipPathDirections = {
    right: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)',
    left: 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)',
    top: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
    bottom: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)'
  };

  // Direction to where to animate the content image (using clip-path)
  const imageDirection = imageElement.dataset.dir;

  // Use the direction to get the corresponding clip-path values, defaulting to full visibility if direction is unknown
  const clipPath = {
    from: clipPathDirections[imageDirection] || 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
    to: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
  };

  return clipPath;
}

// Utility function to toggle the display of work based on mouse events
const toggleWork = (event, isShowing) => {
  // Retrieve the href attribute of the target link to identify the content to show/hide
  const href = event.target.getAttribute('href');
  const contentElement = document.querySelector(href);

  // Using the data-bg attribute to find the corresponding background element
  const bgId = contentElement.dataset.bg;
  const bgElement = document.querySelector(`#${bgId}`);

  // Selecting title and images within the content element
  const contentTitle = contentElement.querySelector('.content__title');
  const contentImages = [...contentElement.querySelectorAll('.content__img')];
  const contentInnerImages = [...contentElement.querySelectorAll('.content__img-inner')];

  // Cancel any ongoing animations to avoid conflicts
  if (event.target.tlEnter) {
    event.target.tlEnter.kill();
  }
  if (event.target.tlLeave) {
    event.target.tlLeave.kill();
  }

  // Check if we are showing or hiding the content
  if ( isShowing ) {
    // Make the content element visible and position it above others
    gsap.set(contentElement, {zIndex: 1});
    contentElement.classList.add('content--current');

    // Create and play the animation for showing content
    event.target.tlEnter = gsap.timeline({
      defaults: {
        duration: 0.95,
        ease: 'power4'
      }
    })
    .set(bgElement, {opacity: 1})
    .fromTo(contentTitle, {opacity: 0, scale: 0.9}, {opacity: 1, scale: 1}, 0)
    .fromTo(contentImages, {
      xPercent: () => gsap.utils.random(-10, 10),
      yPercent: () => gsap.utils.random(-10, 10),
      filter: 'brightness(300%)',
      clipPath: (index, target) => getClipPath(target)['from']
    }, {
      xPercent: 0,
      yPercent: 0,
      filter: 'brightness(100%)',
      clipPath: (index, target) => getClipPath(target)['to']
    }, 0)
    .fromTo(contentInnerImages, {scale:1.5}, {scale:1}, 0);
  } 
  else {
    // Reset the z-index and prepare the content element for hiding
    gsap.set(contentElement, {zIndex: 0});

    // Create and play the animation for hiding content
    event.target.tlLeave = gsap.timeline({
      defaults: {
        duration: 0.95,
        ease: 'power4'
      },
      onComplete: () => {
        // Remove the visibility class once the animation completes
        contentElement.classList.remove('content--current');
      }
    })
    .set(bgElement, {opacity: 0}, 0.05)
    .to(contentTitle, {opacity: 0}, 0)
    .to(contentImages, {clipPath: (index, target) => getClipPath(target)['from']}, 0)
    .to(contentInnerImages, {scale:1.5}, 0)
  }
};

// Function to handle the mouseenter event on work links
const showWork = event => {
  // Call toggleWork with true to show the content
  toggleWork(event, true);
};

// Function to handle the mouseleave event on work links
const hideWork = event => {
  // Call toggleWork with false to hide the content
  toggleWork(event, false);
};

// Initialize hover effects and video fade in/out for the navigation
const initEvents = () => {
  workLinks.forEach(workLink => {
    let hoverTimer; // Declare a variable to hold the timeout
    workLink.addEventListener('mouseenter', event => {
      // Set a timeout to delay the hover effect
      hoverTimer = setTimeout(() => showWork(event), 30); // Delay the hover effect for 30ms
    });

    workLink.addEventListener('mouseleave', event => {
      // Clear the timeout if the mouse leaves before the delay is over
      clearTimeout(hoverTimer);
      // Immediately trigger the hideWork function
      hideWork(event);
    });
  });

  // Fades out the video/title when hovering over the navigation
  workNav.addEventListener('mouseenter', () => {
    gsap.killTweensOf([video, title]);
    gsap.to([video, title], {
      duration: 0.6,
      ease: 'power4',
      opacity: 0
    })
  });
  // Fades in the video/title when not hovering over the navigation
  workNav.addEventListener('mouseleave', () => {
    gsap.killTweensOf([video, title]);
    gsap.to([video, title], {
      duration: 0.6,
      ease: 'sine.in',
      opacity: 1
    })
  });
}

// Initialize the app once images are preloaded
const init = () => {
  initEvents();
};

// Starts the initialization after preloading images
preloadImages('.content__img-inner').then(() => {
  document.body.classList.remove('loading');
  init();
});
