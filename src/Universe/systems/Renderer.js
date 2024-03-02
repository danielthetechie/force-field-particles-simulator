import { WebGLRenderer } from 'three'

class Renderer
{
  constructor ()
  {
    this.renderer = new WebGLRenderer ();
    return this.renderer;
  }
}

export { Renderer }