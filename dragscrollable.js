/*
 * jQuery dragscrollable Plugin
 * version: 1.3 (17-Feb-2025)
 * Copyright (c) 2009 Miquel Herrera
 * Modified 2016 by Alexander Steinhöfer
 * Modified 2020 by Bilal Bagdad
 * Modified 2025 by Josh Mckibbin
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */
;(function($){ // secure $ jQuery alias

/**
 * Adds the ability to manage elements scroll by dragging
 * one or more of its descendant elements. Options parameter
 * allow to specifically select which inner elements will
 * respond to the drag events.
 *
 * options properties:
 * ------------------------------------------------------------------------
 *  dragSelector         | jquery selector to apply to each wrapped element
 *                       | to find which will be the dragging elements.
 *                       | Defaults to '>:first' which is the first child of
 *                       | scrollable element
 * ------------------------------------------------------------------------
 *  acceptPropagatedEvent| Will the dragging element accept propagated
 *                      | events? default is yes, a propagated mouse event
 *                      | on a inner element will be accepted and processed.
 *                      | If set to false, only events originated on the
 *                      | draggable elements will be processed.
 * ------------------------------------------------------------------------
 *  preventDefault       | Prevents the event to propagate further effectivey
 *                       | dissabling other default actions. Defaults to true
 * ------------------------------------------------------------------------
 *  which                | Sets the mouse button to scroll
 *                       | 1: left click
 *                       | 2: middle click
 *                       | 3: right click
 *                       | defaults to 1
 * ------------------------------------------------------------------------
 *
 *  usage examples:
 *
 *  To add the scroll by drag to the element id=viewport when dragging its
 *  first child accepting any propagated events
 * $('#viewport').dragscrollable();
 *
 *  To add the scroll by drag ability to any element div of class viewport
 *  when dragging its first descendant of class dragMe responding only to
 *  evcents originated on the '.dragMe' elements.
 * $('div.viewport').dragscrollable({dragSelector:'.dragMe:first',
 *                           acceptPropagatedEvent: false});
 *
 *  Notice that some 'viewports' could be nested within others but events
 *  would not interfere as acceptPropagatedEvent is set to false.
 *
 */
$.fn.dragscrollable = function( options ){
  var settings = $.extend({
      dragSelector:'>:first',
      acceptPropagatedEvent: true,
      preventDefault: true,
      which: 1,
      // Hovav:
      allowY: true
  }, options || {});

  var dragscroll= {
    startDrag: function(event, x, y) {
      // Initial coordinates will be the last when dragging
      event.data.lastCoord = {left: x, top: y};
    },
    doDrag: function(event, x, y) {
// How much did the mouse move?
      var delta = {
        left: (x - event.data.lastCoord.left),
        top: ((settings.allowY) ? y - event.data.lastCoord.top : 0)
      };

      // Set the scroll position relative to what ever the scroll is now
      event.data.scrollable.scrollLeft(event.data.scrollable.scrollLeft() - delta.left);
      event.data.scrollable.scrollTop(event.data.scrollable.scrollTop() - delta.top);

      // Save where the cursor is
      event.data.lastCoord={ left: x, top: y };
    },
    /* ==========================================================
       Touch */
    touchStartHandler: function(event) {
      var touch = event.originalEvent.touches[0];
      dragscroll.startDrag(event, touch.pageX, touch.pageY);

      $.event.add( document, "touchend", dragscroll.touchEndHandler, event.data );
      $.event.add( document, "touchmove",  dragscroll.touchMoveHandler, event.data );
    },
    touchMoveHandler: function(event) {
      var touch = event.originalEvent.touches[0];
      dragscroll.doDrag(event, touch.pageX, touch.pageY);
    },
    touchEndHandler: function(event) {
      $.event.remove( document, "touchmove", dragscroll.mouseMoveHandler);
      $.event.remove( document, "touchend", dragscroll.mouseUpHandler);
    },
    /* ==========================================================
        Mouse */
    mouseDownHandler : function(event) {
      // mousedown, selected click, check propagation
      if (event.which != event.data.which || (!event.data.acceptPropagatedEvent && event.target != this)){
        return false;
      }

      dragscroll.startDrag(event, event.clientX, event.clientY);

      $.event.add( document, "mouseup", dragscroll.mouseUpHandler, event.data );
      $.event.add( document, "mousemove",  dragscroll.mouseMoveHandler, event.data );

      if (event.data.preventDefault) {
        event.preventDefault();
        return false;
      }
    },
    mouseMoveHandler : function(event) { // User is dragging
      dragscroll.doDrag(event, event.clientX, event.clientY);

      if (event.data.preventDefault) {
        event.preventDefault();
        return false;
      }
    },
    mouseUpHandler : function(event) { // Stop scrolling
      $.event.remove( document, "mousemove", dragscroll.mouseMoveHandler);
      $.event.remove( document, "mouseup", dragscroll.mouseUpHandler);
      if (event.data.preventDefault) {
        event.preventDefault();
        return false;
      }
    }
  }

   // set up the initial events
  this.each(function() {
    // closure object data for each scrollable element
    var data = {
      scrollable : $(this),
      acceptPropagatedEvent : settings.acceptPropagatedEvent,
      preventDefault : settings.preventDefault,
      which: settings.which
    };
    // Set mouse initiating event on the desired descendant
    $(this).find(settings.dragSelector).on('mousedown',  data, dragscroll.mouseDownHandler);
    $(this).find(settings.dragSelector).on('touchstart', data, dragscroll.touchStartHandler);
  });
}; //end plugin dragscrollable


})( jQuery ); // confine scope
