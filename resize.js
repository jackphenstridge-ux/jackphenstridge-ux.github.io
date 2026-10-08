/* Hero frame resizing — drag a corner handle to change the frame's width,
   like resizing an auto-layout frame in a design tool. Width only: the text
   rewraps and the height follows, so it can't be dragged into a broken state.

   Progressive enhancement. If this never runs, the frame renders exactly as
   its CSS describes and nothing else on the page is affected. */
(function () {
  'use strict';

  var MIN_PX = 352;          // 22rem — below this the headline collapses awkwardly
  var MIN_RATIO = 0.55;      // ...or 55% of the available width, whichever is larger
  var BREAKPOINT = 701;      // matches the CSS guard; below this, resizing is off

  var frame = document.querySelector('.selection');
  if (!frame) return;

  var container = frame.parentElement;        // .wrap.opening — defines the max width
  var handles = frame.querySelectorAll('.selection__handle');
  if (!handles.length || !container) return;

  function enabled() {
    return window.innerWidth >= BREAKPOINT && window.matchMedia('(pointer: fine)').matches;
  }

  function limits() {
    // The container's inner width, i.e. the same content width the tile grid uses.
    var cs = getComputedStyle(container);
    var max = container.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    return { min: Math.min(Math.max(MIN_PX, max * MIN_RATIO), max), max: max };
  }

  var drag = null;

  function onPointerDown(event) {
    if (!enabled() || event.button !== 0) return;

    var handle = event.currentTarget;
    drag = {
      handle: handle,
      pointerId: event.pointerId,
      startX: event.clientX,
      startWidth: frame.getBoundingClientRect().width,
      // Dragging a left-hand handle outward means moving left, so invert it.
      direction: handle.classList.contains('selection__handle--tl') ||
                 handle.classList.contains('selection__handle--bl') ? -1 : 1
    };

    handle.setPointerCapture(event.pointerId);
    frame.classList.add('selection--dragging');
    event.preventDefault();
  }

  function onPointerMove(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;

    var bounds = limits();
    var next = drag.startWidth + (event.clientX - drag.startX) * drag.direction;
    frame.style.width = Math.min(Math.max(next, bounds.min), bounds.max) + 'px';
  }

  function endDrag(event) {
    if (!drag || event.pointerId !== drag.pointerId) return;
    if (drag.handle.hasPointerCapture(event.pointerId)) {
      drag.handle.releasePointerCapture(event.pointerId);
    }
    frame.classList.remove('selection--dragging');
    drag = null;
  }

  Array.prototype.forEach.call(handles, function (handle) {
    handle.addEventListener('pointerdown', onPointerDown);
    handle.addEventListener('pointermove', onPointerMove);
    handle.addEventListener('pointerup', endDrag);
    handle.addEventListener('pointercancel', endDrag);
  });

  // Drop any dragged width when resizing below the breakpoint, and keep it
  // within bounds when the window gets narrower on desktop.
  window.addEventListener('resize', function () {
    if (!frame.style.width) return;
    if (!enabled()) {
      frame.style.width = '';
      return;
    }
    var bounds = limits();
    var current = parseFloat(frame.style.width);
    frame.style.width = Math.min(Math.max(current, bounds.min), bounds.max) + 'px';
  });
})();
