let currentDroppable = null;

function MouseDown (event) {

      let shiftX = event.clientX - document.getElementById(event.currentTarget.id).getBoundingClientRect().left;
      let shiftY = event.clientY - document.getElementById(event.currentTarget.id).getBoundingClientRect().top;

      document.getElementById(event.currentTarget.id).style.position = 'absolute';
      document.getElementById(event.currentTarget.id).style.zIndex = 1000;
      document.body.appendChild(document.getElementById(event.currentTarget.id));

      // moveAt(event.pageX, event.pageY);

      function moveball(pageX, pageY) {
        ball.style.left = pageX - shiftX + 'px';
        ball.style.top = pageY - shiftY + 'px';
      }
      function movedrag2(pageX, pageY) {
        drag2.style.left = pageX - shiftX + 'px';
        drag2.style.top = pageY - shiftY + 'px';
      }
      function movedrag3(pageX, pageY) {
        drag3.style.left = pageX - shiftX + 'px';
        drag3.style.top = pageY - shiftY + 'px';
      }
      function movedrag4(pageX, pageY) {
        drag4.style.left = pageX - shiftX + 'px';
        drag4.style.top = pageY - shiftY + 'px';
      }
      function movedrag5(pageX, pageY) {
        drag5.style.left = pageX - shiftX + 'px';
        drag5.style.top = pageY - shiftY + 'px';
      }
      function movedrag6(pageX, pageY) {
        drag6.style.left = pageX - shiftX + 'px';
        drag6.style.top = pageY - shiftY + 'px';
      }
      function movedrag7(pageX, pageY) {
        drag7.style.left = pageX - shiftX + 'px';
        drag7.style.top = pageY - shiftY + 'px';
      }
      function movedrag8(pageX, pageY) {
        drag8.style.left = pageX - shiftX + 'px';
        drag8.style.top = pageY - shiftY + 'px';
      }
      function movedrag9(pageX, pageY) {
        drag9.style.left = pageX - shiftX + 'px';
        drag9.style.top = pageY - shiftY + 'px';
      }function movedrag10(pageX, pageY) {
        drag10.style.left = pageX - shiftX + 'px';
        drag10.style.top = pageY - shiftY + 'px';
      }
      function movedrag11(pageX, pageY) {
        drag11.style.left = pageX - shiftX + 'px';
        drag11.style.top = pageY - shiftY + 'px';
      }
      function movedrag12(pageX, pageY) {
        drag12.style.left = pageX - shiftX + 'px';
        drag12.style.top = pageY - shiftY + 'px';
      }
      function movedrag13(pageX, pageY) {
        drag13.style.left = pageX - shiftX + 'px';
        drag13.style.top = pageY - shiftY + 'px';
      }
      function movedrag14(pageX, pageY) {
        drag14.style.left = pageX - shiftX + 'px';
        drag14.style.top = pageY - shiftY + 'px';
      }
      let Id =  event.currentTarget.id;
      function onMouseMove(event) {
     
        if (Id=="ball"){
          moveball(event.pageX, event.pageY);
        }
        else if(Id=="drag2"){
          movedrag2(event.pageX, event.pageY);
        }
        else if(Id=="drag3"){
          movedrag3(event.pageX, event.pageY);
        }else if(Id=="drag4"){
          movedrag4(event.pageX, event.pageY);
        }else if(Id=="drag5"){
          movedrag5(event.pageX, event.pageY);
        }else if(Id=="drag6"){
          movedrag6(event.pageX, event.pageY);
        }else if(Id=="drag7"){
          movedrag7(event.pageX, event.pageY);
        }else if(Id=="drag8"){
          movedrag8(event.pageX, event.pageY);
        }else if(Id=="drag9"){
          movedrag9(event.pageX, event.pageY);
        }else if(Id=="drag10"){
          movedrag10(event.pageX, event.pageY);
        }else if(Id=="drag11"){
          movedrag11(event.pageX, event.pageY);
        }else if(Id=="drag12"){
          movedrag12(event.pageX, event.pageY);
        }else if(Id=="drag13"){
          movedrag13(event.pageX, event.pageY);
        }else if(Id=="drag14"){
          movedrag14(event.pageX, event.pageY);
        }

        document.getElementById(event.currentTarget.id).hidden = true;
        let elemBelow = document.elementFromPoint(event.clientX, event.clientY);
        document.getElementById(event.currentTarget.id).hidden = false;

        if (!elemBelow) return;

        let droppableBelow = elemBelow.closest('.droppable');
        if (currentDroppable != droppableBelow) {
          if (currentDroppable) { // null when we were not over a droppable before this event
            leaveDroppable(currentDroppable);
          }
          currentDroppable = droppableBelow;
          if (currentDroppable) { // null if we're not coming over a droppable now
            // (maybe just left the droppable)
            enterDroppable(currentDroppable);
          }
        }
      }
      
      document.addEventListener('mousemove', onMouseMove);
      const targetId = event.currentTarget.id;
      document.getElementById(event.currentTarget.id).onmouseup = function() {
        document.removeEventListener('mousemove', onMouseMove);
        const parent = document.getElementById('image');
        
        parent.appendChild(document.getElementById(targetId));
        document.getElementById(targetId).onmouseup = null;
      };
      document.getElementById(event.currentTarget.id).ondragstart = function() {
        return false;
      };
    };

    function enterDroppable(elem) {
      elem.style.background = 'pink';
    }

    function leaveDroppable(elem) {
      elem.style.background = '';
    }

    function reload(){
      location.reload();
    }


function svgColor(){

}
    