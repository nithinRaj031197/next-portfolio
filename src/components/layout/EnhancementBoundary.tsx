"use client";

import { Component, type ReactNode } from "react";

/**
 * Enhancements (the WebGL scene, scroll reveals) are decoration on top of a complete HTML page. If one throws, render
 * nothing in its place so the page itself is never replaced by an error screen. A client boundary (class components
 * are client-only) used from the server page and from SceneRoot.
 */
export class EnhancementBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
