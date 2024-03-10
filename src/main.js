import { Universe } from "./Universe/Universe.js";
import { ControlPanel } from "./GUI/ControlPanel.js";

document.addEventListener ("DOMContentLoaded", e => 
{
	const universe_settings = {
		gravitational_constant: -1,
		global_radius: 600,
		number_of_particles: 300,
		particles_initial_distance_from_origin: 10,
		particles_initial_max_speed_per_axis: 0,
		max_mass_particles: 300, 
		min_mass_particles: 10,
		enlarge_radius_after_bonding: true
	}
	
	let container = document.getElementById ("scene-container");
	let universe = new Universe ({
		container: container, 
		...universe_settings
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
	}, 10);
});