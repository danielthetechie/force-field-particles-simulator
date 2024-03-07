import { Universe } from "./Universe/Universe.js";
import { ControlPanel } from "./GUI/ControlPanel.js";

//const control_panel = new GUI ();


document.addEventListener ("DOMContentLoaded", e => 
{
	const universe_settings = {
		gravitational_constant: -1,
		global_radius: 2000,
		number_of_particles: 400
	}
	
	//control_panel.add (myObject, 'myBoolean' );  // Checkbox
	
	let container = document.getElementById ("scene-container");
	let universe = new Universe ({
		container: container, 
		gravitational_constant: universe_settings.gravitational_constant, 
		global_radius: universe_settings.global_radius, 
		particles_initial_distance_from_origin: 0,
		particles_initial_max_speed_per_axis: 1,
		number_of_particles: universe_settings.number_of_particles, 
		max_mass_particles: 1000, 
		min_mass_particles: 100
	});

	const control_panel = new ControlPanel (universe);
	control_panel.setRangeProperty ('number_of_particles', 1, 1000, 1, "Número de partículas");
	control_panel.setRangeProperty ('global_radius', 10, 5000, 50, "Radio del universo");

	universe.start ();

	let remaining_particles_value = document.getElementById ("remaining-particles-value");
	let system_average_speed = document.getElementById ("system-average-speed");

	let info_interval = setInterval (() =>
	{
		if (universe != null)
		{
			remaining_particles_value.innerHTML = universe.variables_info.get ("remaining_particles");
			system_average_speed.innerHTML = universe.variables_info.get ("system_average_speed");
		}
	}, 300);
	
	/*control_panel.add (universe_settings, 'global_radius', 1, 5000, 10).onFinishChange ((new_global_radius) => 
	{
		universe_settings.global_radius = new_global_radius;

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
				global_radius: new_global_radius, 
				particles_initial_distance_from_origin: 0,
				particles_initial_max_speed_per_axis: 0,
				number_of_particles: universe_settings.number_of_particles,
				max_mass_particles: 10, 
				min_mass_particles: 3
			});
		
			universe.start ();
		}
	});

	control_panel.add (universe_settings, 'number_of_particles', 1, 1000, 1).onFinishChange (new_number_of_particles => 
	{
		universe_settings.number_of_particles = new_number_of_particles;
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
});