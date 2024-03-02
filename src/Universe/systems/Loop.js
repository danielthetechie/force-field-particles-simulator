import { Clock } from 'three';

const clock = new Clock ();

class Loop 
{
	#camera;
	#scene;
	#renderer;
	#controls;
	#clock;

	constructor (camera, scene, renderer, controls = null)
	{
		this.#camera = camera;
		this.#scene = scene;
		this.#renderer = renderer;
		this.#controls = controls;

		this.#clock = new Clock (false); 
		this.updatables = [];
	}

	start ()
	{
		if (!this.#clock.running) 
		{
			this.#clock.start();
		}

		this.#renderer.setAnimationLoop (() => 
	    {
		    this.tick ();
			
			if (this.#controls != null)
			{
				this.#controls.update ();
			}
			
	        this.#renderer.render (this.#scene, this.#camera);
	    });
	}

	stop ()
	{
		if (this.#clock.running) 
		{
			this.#clock.stop ();
		}

		this.#renderer.setAnimationLoop (null);
	}

	tick ()
	{
		let delta = this.#clock.getDelta ();
		
		for (let object of this.updatables)
		{
			object.tick (delta);
		}
	}
}

export { Loop };