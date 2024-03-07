import GUI from 'lil-gui';

class ControlPanel
{
    constructor (universe)
    {
        this.gui = new GUI ();
        this.universe = universe;
        this.universe_settings = {
            gravitational_constant: -1,
            global_radius: 200,
            number_of_particles: 400
        }
    }

    setRangeProperty (property, min, max, step, name = null)
    {
        let added_property = this.gui.add (this.universe_settings, property, min, max, step).onFinishChange (new_value => 
        {
            this.universe_settings[property] = new_value;
            if (this.universe != null)
            {
                // We will reuse the renderer, since we cannot dispose WebGL.
                let existing_renderer = this.universe.getRenderer();
                let existing_container = this.universe.container;

                //this.universe.stop ();

                this.universe.updateProperties (this.universe_settings);
                
                //this.universe.start ();
            }
        });

        if (name != null)
        {
            added_property.name (name);
        }
    }
}

export { ControlPanel }

/*
control_panel.add (universe_settings, 'gravitational_constant', -100, 100, 1)
	.name ('Constante de fuerza')
	.onFinishChange (new_gravitational_constant => 
	{
		universe_settings.gravitational_constant = new_gravitational_constant;

		if (universe != null)
		{
			// We will reuse the renderer, since we cannot dispose WebGL.
			let existing_renderer = universe.getRenderer();

			universe.selfDestroy ();
			universe = null;
			//clearInterval (info_interval);
	
			universe = new Universe ({
				container: container,
				renderer: existing_renderer,
				gravitational_constant: universe_settings.gravitational_constant,
				global_radius: universe_settings.global_radius,
				particles_initial_distance_from_origin: 0,
				particles_initial_max_speed_per_axis: 0,
				number_of_particles: universe_settings.number_of_particles, 
				max_mass_particles: 10, 
				min_mass_particles: 3
			});
		
			universe.start ();
		}
	});*/