import { Universe } from "./Universe/Universe.js";
import { ControlPanel } from "./GUI/ControlPanel.js";

//const control_panel = new GUI ();


document.addEventListener ("DOMContentLoaded", e => 
{
	const universe_settings = {
		gravitational_constant: -1,
		global_radius: 500,
		number_of_particles: 100,
		particles_initial_distance_from_origin: 0,
		particles_initial_max_speed_per_axis: 0,
		max_mass_particles: 1000, 
		min_mass_particles: 100
	}
	
	//control_panel.add (myObject, 'myBoolean' );  // Checkbox
	
	let container = document.getElementById ("scene-container");
	let universe = new Universe ({
		container: container, 
		gravitational_constant: universe_settings.gravitational_constant,
		global_radius: universe_settings.global_radius, 
		particles_initial_distance_from_origin: universe_settings.particles_initial_distance_from_origin,
		particles_initial_max_speed_per_axis: universe_settings.particles_initial_max_speed_per_axis,
		number_of_particles: universe_settings.number_of_particles, 
		max_mass_particles: universe_settings.max_mass_particles,
		min_mass_particles: universe_settings.min_mass_particles
	});

	new ControlPanel (universe);

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
});