export function segmentHitsEllipse(rect,from,to,scale=.72) {
  const centerX=(rect.left+rect.right)/2,centerY=(rect.top+rect.bottom)/2;
  const radiusX=Math.max(1,(rect.right-rect.left)*scale/2);
  const radiusY=Math.max(1,(rect.bottom-rect.top)*scale/2);
  const startX=(from.x-centerX)/radiusX,startY=(from.y-centerY)/radiusY;
  const endX=(to.x-centerX)/radiusX,endY=(to.y-centerY)/radiusY;
  const deltaX=endX-startX,deltaY=endY-startY;
  const lengthSquared=deltaX*deltaX+deltaY*deltaY;
  const t=lengthSquared ? Math.max(0,Math.min(1,-(startX*deltaX+startY*deltaY)/lengthSquared)) : 0;
  const nearestX=startX+deltaX*t,nearestY=startY+deltaY*t;
  return nearestX*nearestX+nearestY*nearestY<=1;
}
