// This script is added to index.html and handles SPA redirects for GitHub Pages
// It works in conjunction with the 404.html file
(function() {
  // If we're not on GitHub Pages, don't do anything special
  if (!window.location.href.includes('github.io')) return;

  // Parse the URL
  var l = window.location;
  
  // Check if we need to redirect
  if (l.search[1] === '/') {
    var decoded = l.search.slice(1).split('&').map(function(s) { 
      return s.replace(/~and~/g, '&');
    }).join('?');
    
    window.history.replaceState(
      null, 
      null,
      l.pathname.slice(0, -1) + decoded + l.hash
    );
  }
})();
