import React from 'react';
// A failed optional GPU scene must never unmount the portfolio.
export default class VisualBoundary extends React.Component {
 state = {failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 componentDidCatch(error){console.warn('Visual unavailable; keeping portfolio visible.',error);}
 render(){return this.state.failed ? (this.props.fallback || null) : this.props.children;}
}
