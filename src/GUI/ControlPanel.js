import GUI from 'lil-gui';

class ControlPanel
{
    constructor (universe)
    {
        this.gui = new GUI ();
        this.universe = universe;
        this.universe_settings = {
            gravitational_constant: this.universe.gravitational_constant,
            global_radius: this.universe.global_radius,
            particles_initial_distance_from_origin: this.universe.particles_initial_distance_from_origin,
            particles_initial_max_speed_per_axis: this.universe.particles_initial_max_speed_per_axis,
            number_of_particles: this.universe.getNumberOfParticles (), 
            max_mass_particles: this.universe.max_mass_particles,
            min_mass_particles: this.universe.min_mass_particles
        }

        this.setRangeProperty ('gravitational_constant', -10, 10, 1, "Constante de fuerza");
        this.setRangeProperty ('global_radius', 10, 5000, 50, "Radio del universo");
        this.setRangeProperty ('particles_initial_distance_from_origin', 0, 100, 1, "Distancia mínima al\ncentro del universo (%)");
        this.setRangeProperty ('particles_initial_max_speed_per_axis', 0, 10, 1, "Velocidad inicial aleatoria\nmáxima de las partículas");
        this.setRangeProperty ('number_of_particles', 1, 1000, 1, "Número inicial de partículas");
        this.setRangeProperty ('max_mass_particles', 1, 1000, 10, "Masa aleatoria máxima\nde las partículas");
        this.setRangeProperty ('min_mass_particles', 1, 100, 1, "Masa aleatoria mínima\nde las partículas (%)");
    }

    setRangeProperty (property, min, max, step, name = null)
    {
        let added_property = this.gui.add (this.universe_settings, property, min, max, step).onFinishChange (new_value => 
        {
            switch (property) 
            {
                case 'particles_initial_distance_from_origin':
                    new_value = this.universe_settings.global_radius * (new_value / 100);
                    break;
                case 'min_mass_particles':
                    new_value = this.universe_settings.max_mass_particles * (new_value / 100);
                    break;
                default:
                    break;
            }
            
            this.universe_settings[property] = new_value;

            if (this.universe != null)
            {
                // We will reuse the renderer, since we cannot dispose WebGL.
                let existing_renderer = this.universe.getRenderer();
                let existing_container = this.universe.container;

                this.universe.stop ();

                this.universe.updateProperties (this.universe_settings);
                
                this.universe.start ();
            }
        });

        if (name != null)
        {
            added_property.name (name);
        }
    }
}

export { ControlPanel }