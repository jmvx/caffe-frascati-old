/*******************************************************************************
 * slideshow.js
 *
 * Copyright (c) 2013 Julia Van Cleve
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 ******************************************************************************/


// a = duration to show each image, in seconds
// b = duration of crossfade, in seconds
function JMVXSlideshow(images, target, a, b) {
  target.data('images', new Array);
  
  // After all images are loaded, we can set up the CSS to animate
  target.on('onLoadComplete', function () {
    var imgs = target.data('images');
    var n = imgs.length;
    var t = (a + b) * n;
    
    // Add CSS to each image
    $.each(imgs, function(i, item) {
      $(item).css({
        'animation-name': 'jmvxSlideshow',
        'animation-timing-function': 'ease-in-out',
        'animation-iteration-count': 'infinite',
        'animation-duration': t.toString() + 's',
        
        // The last image added occludes the others, so we start its animation
        // first
        'animation-delay': ((a + b) * (n - i - 1)).toString() + 's'
      });
    });
    
    // Create the keyframes for the animation
    // Based on http://css3.bradshawenterprises.com/cfimg/
    var keyframes = '';
    [ '', '-webkit-', '-moz-' ].forEach(function (prefix) {
      keyframes += '@' + prefix + 'keyframes jmvxSlideshow {\n';
      keyframes += '\t0% { opacity: 1; }\n';
      keyframes += '\t' + Math.round(100*a/t) + '% { opacity: 1; }\n';
      keyframes += '\t' + Math.round(100/n) + '% { opacity: 0; }\n';
      keyframes += '\t' + Math.round(100*(1-(b/t))) + '% { opacity: 0; }\n';
      keyframes += '\t100% { opacity: 1; }\n';
      keyframes += '}\n\n';
    });
    target.append($('<style type="text/css" scoped>' + keyframes + '</style>'));
    
    // Add all the images to the DOM
    target.append(imgs);
  });
  
  // Load each image
  $.each(images, function(i, item) {
    var img = new Image();
    img.onload = function() {
      target.data('images').push(img);
      if (target.data('images').length == images.length)
        target.trigger('onLoadComplete');
    }
    img.src = item;
  });
  
}